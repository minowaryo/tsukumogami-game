# ADR-0001: 試作キャラ画像の生成基盤に ComfyUI（ローカル）を採用し、段階間の変換だけクラウドの画像編集 AI を併用する

## Status
Proposed

## Date
2026-10-20

## Context

- 付喪神の擬人化（Lv0〜4）の試作画像を、キャラの同一性を保ったまま大量に作る必要がある。仕様は
  `docs/characters/`（Character Bible、YAML）にまとめてあり、試作3体は柱時計・提灯・ピアノ
- **キャラが可愛いこと**がゲームの売り（原案の差別化：「本気の萌え」「可愛さ・日本らしさ」）。
  同一性や自動化ができても、可愛くなければ意味がない
- 原案では AI 画像は試作専用だったが、**出来栄えが良ければ AI 生成素材をそのままリリースに使う**方針に変わった（ADR-0002）。
  リリースに使うかどうかが決まるまでは、生成画像は `assets/proto/` に置き、ファイル名・フォルダで本番素材と区別する
- このため、画像生成ツールには次のことが求められる
  1. **プログラムから操作できる**：Character Bible の YAML からプロンプトを組み立てて、自動で生成する
  2. **再現できる**：モデル・seed・設定を記録し、同じ画像を作り直せる（イラストレーターへの発注資料にもなる）
  3. **一貫性を保つ部品が使える**：LoRA、ControlNet、IP-Adapter、img2img
  4. **手元の PC で動く**：RTX 3070 Ti Laptop（VRAM 8GB）
  5. **アニメ特化モデルが使える**：SDXL 系の Illustrious / NoobAI 系
  6. **試作で数百〜数千枚を回しても費用が膨らまない**
- 原案（`03_production.md`）でも「Stable Diffusion 系 + キャラ別 LoRA、ComfyUI で運用」が候補に挙がっていた

## Decision

1. **普段の生成と自動 QC は、ローカルの ComfyUI で行う**
   - ComfyUI は「生成エンジン」として裏で動かし、Python のハーネススクリプトが HTTP API で操作する
     （`POST /prompt` で処理を投入、`GET /history/{prompt_id}` と `GET /view` で結果を受け取る、`/ws` で進捗を受け取る）
   - ハーネス側の担当：YAML の読み込み → プロンプトの組み立て（`_common.yaml` の組み立て順）→ 投入 → QC → 生成ログ（JSONL）の記録
   - ComfyUI の GUI は、人が試行錯誤するときだけ使う
   - モデルは SDXL 系アニメモデル（Illustrious / NoobAI 系）から選ぶ。具体的なチェックポイントは、試し生成とライセンス確認の後に決める
2. **クラウドの画像編集 AI は、段階間の変換で品質が足りないときだけ使う**（例：Lv3 → Lv4 で同じ人物に見えない）
   - 候補：FLUX 系の編集モデル（Kontext / FLUX.2 Edit）、Gemini の画像生成・編集（Nano Banana 系）
   - どれを使うかは、試作キャラで実際に比べてから決める
   - クラウドで作った画像も、ローカルと同じ QC と生成ログ（使ったサービス名・モデル名を含む）を通す
   - **呼び出し方**：まず ComfyUI 公式の**パートナーノード**（クラウドのモデルをワークフローの箱として呼ぶ仕組み、
     Comfy アカウントのクレジットで支払う）を使う。ローカルとクラウドが同じワークフロー・同じ投入口・同じ生成ログに収まり、
     各社の API キーを別々に管理しなくてよいため
   - パートナーノードが対応していないモデルが必要になったときだけ、Python スクリプトから各社の API を直接呼ぶ。
     その場合も、生成ログの形式（JSONL）と QC はローカルと共通にする
   - 第三者が作ったクラウド連携のカスタムノードは使わない（Decision 3 の許可リストの対象外）
3. **安全面の運用ルール**（下記「Drawbacks / Risks」への対策）
   - ComfyUI は **localhost だけで待ち受ける**（`--listen` で外部公開しない）
   - カスタムノードは**一覧（許可リスト）にあるものだけ**入れ、バージョンを固定する。入れる前にリポジトリの出所を確認する
   - ComfyUI-Manager を使う場合は、CVE-2025-67303 を修正したバージョン（3.38 以降）にする
   - ComfyUI 本体とノードのバージョンを固定し、更新は意図して行う
   - クラウド API のキー（Comfy アカウントの API キーを含む）は `.env` だけに置く（`.claude/rules/40-security.md`）
   - **クラウドの費用は月 40 ドルまで**（2026-10-20 Ryo 決定。パートナーノードと各社 API の直接呼び出しの合計）
     - クレジットは前払いで、1か月に買う額を 40 ドル以内にする。自動チャージ（残高が減ったら自動で買い足す設定）は使わない
     - ハーネスは生成ログに1回ごとの消費クレジットを記録し、その月の合計が上限に近づいたらクラウドの呼び出しを止めて知らせる
     - 1回の実行で残高を超えて一時的にマイナスになることがあるため、上限ちょうどまで使い切らず余裕を残す
     - 目安：1 ドル ≒ 211 クレジット（公式の記載はなく、FLUX Kontext Pro の元の価格からの逆算）。画像1枚あたり約 0.01〜0.15 ドル
4. **前提作業**：NVIDIA ドライバを更新する（現在 511.65 で、最近の PyTorch / CUDA には古い可能性が高い）
5. **採用は「可愛さの比較テスト」に合格してから確定する**（下記「可愛さを担保できるか」）。
   ローカル（ComfyUI）が他のツールより明らかに可愛くない場合は、この ADR を見直す

## Rationale

- **再現性（要件2）が最大の理由**。ComfyUI は生成の流れ全体を JSON として保存・投入できるので、
  Character Bible と生成ログを合わせれば、どの画像をどの設定で作ったかを完全に再現できる
- **自動化（要件1）**：公式ドキュメントに HTTP / WebSocket API が載っており、GUI なしで操作できる
- **一貫性の部品（要件3）と 8GB での動作（要件4）**：LoRA・ControlNet・IP-Adapter を組み合わせて使え、メモリ管理も上手い
- **開発が活発**：2026年も定期的にリリースされている（v0.26 系、2026年6月）。AUTOMATIC1111 系は本体の開発が止まりかけている
- **費用（要件6）**：ローカルなので生成枚数に応じた費用がかからない。クラウドは必要な場面に絞るので費用を抑えられる
- **クラウド併用の理由**：段階間の変換（顔を隠した人影 → 顔の見える同じ人物）はローカル SDXL では安定しにくい可能性があり、
  複数の参照画像を使った編集に強いクラウドモデルが役に立つ。ただし常用すると費用と依存が増えるので、補助に留める

### 可愛さを担保できるか（各ツールの調査結果、2026-10-20 時点）

Web 上には、ツールどうしの可愛さを同じ条件で比べた信頼できる資料が見つからなかった。
個人の感想・販売側の記事が中心なので、**下の表は「試す価値があるか」の判断材料に留め、可愛さは実際に生成して確かめる**。

| ツール | 可愛さについて分かったこと | 懸念 | 比較テストでの扱い |
|---|---|---|---|
| Illustrious XL 系（ローカル） | アニメ・2D では Pony 系より背景・体の描写が良いという利用者の声が多い。派生モデルが豊富で、絵柄を選べる | 素の状態は絵柄が素朴に見えるという声もある。派生モデルの選び方で可愛さが大きく変わる | 派生モデルを2〜3種試す |
| NoobAI XL 系（ローカル） | Illustrious をもとに Danbooru タグで鍛えたモデル。タグの効きが良い。v-pred 版は独特の絵柄 | 派生モデルごとにライセンスが違う | 1〜2種試す |
| Gemini（Nano Banana 系、クラウド） | 参照画像を最大14枚使え、同一性に強いとされる | アニメ絵の可愛さについての情報はほぼない。編集を重ねると顔が変わる、並列で呼ぶと髪色などがぶれるという報告。「〜しない」という否定の指示が苦手 | 段階間の変換（Lv3 → Lv4）で試す |
| FLUX 系の編集モデル（Kontext / FLUX.2 Edit、クラウド） | 編集を繰り返してもキャラが崩れにくいと公式が説明 | アニメの線や塗りが編集後も保たれるかを検証した資料がない。指示を盛りすぎると画像が変わりすぎる | 段階間の変換で試す |
| NovelAI（クラウド、アニメ特化） | 2026年8月に V5 が出たとされる（未確認）。アニメの可愛さでは評判が高い | 自動化の規約確認が必要。LoRA・ControlNet は使えない | 自動化はしない。**可愛さの基準（どこまで可愛くできるかの目安）**として手作業で数枚作る |
| Midjourney Niji（クラウド） | 一枚絵の美しさは最上位という評価 | 公式 API がない。最新版ではキャラ参照（`--cref`）が使えないという情報がある（未確認） | 同上。可愛さの基準として手作業で数枚 |

#### 比較テストの方法（案）

- **対象**：試作3体（柱時計・提灯・ピアノ）の Lv1・Lv3・Lv4。Lv1 は「物の可愛さ」、Lv4 は「人の可愛さ」で、ツールの得意不得意が分かれる可能性がある
- **枚数**：ツール × キャラ × 段階ごとに 8 枚。プロンプトは Character Bible から作り、ツールごとの書き方の違いだけ直す
- **見せ方**：**ツール名を隠して並べ**、Ryo が評価する（先入観をなくすため）
- **評価の観点**（各 1〜5 点）
  1. ひと目で「可愛い」と思うか（第一印象）
  2. **大人に見えるのに可愛いか**（大人ルールとの両立。ここが一番難しい）
  3. 目と表情（目の描き方、表情の豊かさ）
  4. 線と塗りのきれいさ（崩れ、濁り）
  5. Lv1 の物の可愛さ（記号的な顔が気持ち悪くないか）
  6. 段階をまたいだ同一性（Lv3 と Lv4 が同じ人に見えるか）
  7. **歩留まり**（8 枚中、採用してよいと思える枚数）
- **合格の目安**：ローカル（ComfyUI）の最良の組み合わせが、観点1・2・7 でクラウドの最良と同じくらいか、それ以上であること。
  足りない部分（例：段階間の同一性）は、クラウドの編集で補えるかを合わせて見る
- **結果の記録先**：この ADR に追記し、採用したチェックポイント名・設定を `docs/characters/_common.yaml` の `generation` に反映する

### Rejected Alternatives

- **AUTOMATIC1111 / Forge**：API はあるが、設定が画面側に散らばり再現性で劣る。A1111 本体は 2024年の v1.10.1 以降ほぼ止まっており、
  Forge 自体も「作り直し中」と案内している
- **Fooocus**：手軽さ重視で、LoRA・ControlNet の細かい制御や自動化に向かない
- **Python で直接（diffusers）**：制御は最大だが、ComfyUI が既に持つ部品の組み込みやメモリの工夫を自分で作り直すことになる。
  ComfyUI だけで足りないことが分かったら再検討する
- **NovelAI / PixAI（クラウドのアニメ特化）だけで作る**：参照画像による同一性は強いが、LoRA・ControlNet の制御が限られ、
  生成ごとの費用がかかる。自動化について規約の確認も必要
- **Midjourney（Niji）**：一枚絵の質は高いが、公式 API がなく、規約上自動化できない。人が手で案出しする用途なら使ってよい
- **クラウドの画像編集 AI だけで作る**：自動化と同一性は強いが、アニメ絵の安定性はアニメ特化モデルに劣る可能性が高く、
  枚数に比例して費用がかかる

## Consequences

### Benefits
- Character Bible → 生成 → QC → 記録が一本の流れになり、同じ画像を作り直せる
- 生成ログと採用画像の seed が、そのままイラストレーターへの発注資料になる
- 普段の生成に費用がかからないので、試作を気軽に回せる

### Drawbacks / Risks
- **カスタムノードは任意のコードを実行できる**：過去に、情報を盗む悪意のあるノード（ComfyUI_LLMVISION、2024年）や、
  ネットに公開された ComfyUI を狙う暗号資産の採掘ボットネット（2026年4月、1,000台以上）の事例がある
  → Decision 3 の運用ルールで対策する
- **モデルのライセンス**：Illustrious / NoobAI の本体は FAIPL-1.0-SD 系だが、NoobAI には独自の制限が追加されており、
  派生モデルには商用利用を禁止しているものもある。**AI 生成素材をリリースに使う可能性がある（ADR-0002）ので、
  チェックポイント・LoRA・クラウドサービスは、比較テストの前から商用利用できるものだけを候補にする**
- **学習コスト**：ComfyUI の処理の流れ（ワークフロー）は複雑。最初のワークフローは Claude が組み、Ryo は YAML と結果の選別に集中する
- **8GB の限界**：SDXL の LoRA 学習や大型の編集モデルはぎりぎりか、遅い。必要ならクラウド GPU を短時間借りる
- **Comfy のクレジットへの依存**：パートナーノードは無料枠がなく、使えるモデルも Comfy が対応したものに限られる。
  料金は各社の元の価格と同じと説明されているが、実際の単価は使う前に料金ページで確認する
- **クラウドの比較は未実施**：どのクラウドモデルが段階間の変換に向くかは、この ADR の時点では検証していない

### Open（この ADR の範囲外）
- ハーネススクリプト（Python）を、このリポジトリのどこに置くか。ゲーム本体（スマホアプリ）とは分ける想定
- 自動 QC に使う道具（顔検出器、WD14 系のタガー）の選定

## Related
- `docs/characters/README.md`、`docs/characters/_common.yaml`（Character Bible と生成ルール）
- `docs/original-docs/tsukumogami-game/docs/03_production.md`（原案の AI ツール候補）
- `.claude/rules/40-security.md`（秘密情報の扱い）
- 調査で参照した情報源：
  - ComfyUI サーバーの API: https://docs.comfy.org/development/comfyui-server/comms_routes
  - ComfyUI の変更履歴: https://docs.comfy.org/changelog
  - パートナーノード（クラウドのモデル呼び出し）: https://docs.comfy.org/tutorials/partner-nodes/overview
  - パートナーノードの紹介: https://blog.comfy.org/p/comfyui-native-api-nodes
  - 悪意あるカスタムノード（2024）: https://gigazine.net/gsc_news/en/20240611-comfyui-llmvision-malware
  - 公開 ComfyUI を狙うボットネット（2026）: https://thehackernews.com/2026/04/over-1000-exposed-comfyui-instances.html
  - 同上の分析と CVE-2025-67303: https://labs.cloudsecurityalliance.org/research/csa-research-note-ai-workload-exposure-cryptomining-20260408/
  - NoobAI-XL のライセンス表記: https://huggingface.co/Panchovix/noobai-XL-1.1-perpendicular-cyberfix/blob/528a09992587a48308fbe5b5f23322ef1cecfa13/README.md
  - FLUX.1 Kontext: https://arxiv.org/html/2506.15742v2
  - アニメ系チェックポイントの比較（2026）: https://insiderllm.com/guides/best-anime-stylized-checkpoints-local-image-generation/
  - ローカルのアニメモデル比較（Anima・NoobAI・Illustrious・Pony）: https://airmore.ai/ja/ai-review/local-anime-ai-image-models-comparison
  - Nano Banana 2 の並列生成でのぶれ: https://workalizer.com/insights/gemini/geminis-nanobanana-2-parallel-image-generation-consistency-challenges-and-workflow-impact/
  - Nano Banana のよくある問題: https://www.dzine.ai/blog/fix-nano-banana-pro-issues/
  - NovelAI と Midjourney の比較: https://knowara.com/ai-tools/image/novelai-vs-midjourney/
  - Niji V7 のキャラ参照非対応の情報: https://www.toolworthy.ai/en/tool/nijijourney-v7
