/** @param {NS} ns */
export async function main(ns) {
    let targets = [];
    if (ns.args.length > 0) {
        targets = ns.args.map(arg => String(arg));
    } else {
        targets = ["n00dles", "foodnstuff", "sigma-cosmetics", "joesguns"];
    }
    targets = targets.filter(t => ns.serverExists(t));

    if (targets.length === 0) {
        ns.tprint(`[実況席] 「おいおい！実況対象のサーバーが1つも見当たりません！スペルミスか、存在しないサーバーのようです！」`);
        return;
    }

    ns.tprint(`================================================================`);
    ns.tprint(`[実況席] 「全国のネットランナーの皆様、お待たせいたしました！`);
    ns.tprint(`         これより、合計 ${targets.length} 台のサーバーを対象とした`);
    ns.tprint(`         マルチチャンネル・ハッキングライブ実況生中継をお送りいたします！」`);
    ns.tprint(`[解説者] 「複数サーバー同時監視ですか。ハッカー側の並行処理能力と、`);
    ns.tprint(`           我々実況陣の動体視力が試される過酷なマッチになりそうですね。」`);
    ns.tprint(`[実況席] 「対象サーバー: [ ${targets.join(", ")} ]」`);
    ns.tprint(`================================================================`);
    const serverStates = {};
    for (const target of targets) {
        serverStates[target] = {
            lastMoney: ns.getServerMoneyAvailable(target),
            lastSec: ns.getServerSecurityLevel(target),
            minSec: ns.getServerMinSecurityLevel(target),
            maxMoney: ns.getServerMaxMoney(target)
        };
    }
    const commentData = {
        hack: {
            success: [
                (t, amt, pct) => `[実況] 「決まったーー！！[${t}]から \$${ns.format.number(amt)} を強奪！奪取率 ${pct}%、完璧なコントロール！」`,
                (t, amt, pct) => `[実況] 「電光石火！ハッカー陣、[${t}]の懐へ鋭く踏み込み、\$${ns.format.number(amt)} をかっさらいました！」`,
                (t, amt, pct) => `[実況] 「これは痛烈！[${t}]のセキュリティの隙を突き、\$${ns.format.number(amt)} を瞬時にキャッシュアウト！」`,
                (t, amt, pct) => `[実況] 「美しいコマンドワーク！[${t}]の防御をあざ笑うかのように \$${ns.format.number(amt)} を引き抜いていく！」`,
                (t, amt, pct) => `[解説] 「今の[${t}]への侵入経路は非常にスマートでしたね。パケットの無駄が一切ありません。」`,
                (t, amt, pct) => `[実況] 「お見事！[${t}]の管理者からため息が漏れる！ \$${ns.format.number(amt)} （${pct}%）のハック成功！」`,
                (t, amt, pct) => `[実況] 「出たー！ハッカーの必殺コンボ！[${t}]から \$${ns.format.number(amt)} が口座へと流れ込みます！」`,
                (t, amt, pct) => `[解説] 「まさに職人技。キーボードのキーが悲鳴を上げるほどの超高速タイピングが生んだ得点です。」`,
                (t, amt, pct) => `[実況] 「相手は一歩も動けない！[${t}]の防衛網をステルスで突破し、\$${ns.format.number(amt)} を華麗に回収！」`,
                (t, amt, pct) => `[解説] 「素晴らしい。ハッカーチームのタクティカル・ハックが光る瞬間です。」`
            ],
            fail: [
                (t) => `[実況] 「ああっと！[${t}]でのハッキングは空振り！資金を奪い取ることはできません！」`,
                (t) => `[解説] 「[${t}]のパッチ当てのタイミングと競合しましたかね。惜しいシーンでした。」`,
                (t) => `[実況] 「防衛システム起動！[${t}]のファイアウォールに弾かれ、ハッカー陣は一時後退！」`,
                (t) => `[実況] 「くっ、ガードが固い！[${t}]のキャッシュに手が届きそうで届きません！」`,
                (t) => `[解説] 「まぁ、焦ることはありません。[${t}]は逃げませんから。次のウェーブを待ちましょう。」`
            ],
            critical: [
                (t, amt) => `[実況] 「神業降臨ーー！！[${t}]を完全ハッキング！ 一撃で \$${ns.format.number(amt)} という規格外のマネーを強奪！」`,
                (t, amt) => `[解説] 「これは年間ベストプレイ候補確定でしょう！[${t}]の金庫がほぼすっからかんです！」`,
                (t, amt) => `[実況] 「なんという破壊衝動！ [${t}]の脆弱性を徹底的に粉砕し、\$${ns.format.number(amt)} をゴリ押しで奪い去ったー！」`,
                (t, amt) => `[解説] 「圧巻の一言。このレベルのハックを決められると、防衛システムは再起動すら困難になります。」`
            ]
        },
        grow: {
            increase: [
                (t, diff, pct) => `[実況] 「さあ、資金を育てる『GROW』が[${t}]に炸裂！ 資金が \$${ns.format.number(diff)} 急上昇（+${pct}%）！」`,
                (t, diff, pct) => `[実況] 「マネーの種を植えていく！[${t}]の価値を \$${ns.format.number(diff)} 引き上げ、次なる収穫期に備えます！」`,
                (t, diff, pct) => `[解説] 「素晴らしい畑作り（育成）です。これで[${t}]は再び最高品質のハック対象に仕上がりました。」`,
                (t, diff, pct) => `[実況] 「バブル到来！[${t}]の資金上限に向けて、+${pct}% の怒濤のキャッシュインジェクション！」`,
                (t, diff, pct) => `[実況] 「パンプアップ！極上のプロテインを注ぐように、[${t}]に \$${ns.format.number(diff)} をマッスル注入！」`,
                (t, diff, pct) => `[解説] 「肥沃な土地に水を撒くように、着実にサーバーの財布が膨らんでいます。素晴らしいゲームプランです。」`,
                (t, diff, pct) => `[実況] 「ハッカーたちの錬金術！[${t}]の金庫へ \$${ns.format.number(diff)} がどんどんチャージされています！」`
            ]
        },
        weaken: {
            decrease: [
                (t, diff, cur) => `[実況] 「ここで『WEAKEN』投下ーー！！[${t}]のセキュリティを ${diff.toFixed(2)} ポイント低下させることに成功！」`,
                (t, diff, cur) => `[実況] 「冷徹なデバフ攻撃！[${t}]の強固な防衛壁がガラガラと崩れ（現在値: ${cur.toFixed(2)}）、無防備になっていきます！」`,
                (t, diff, cur) => `[解説] 「[${t}]をしっかり冷やす（Weakenする）丁寧な立ち回り。プロの試合を見ているようです。」`,
                (t, diff, cur) => `[実況] 「セキュリティを紙やすりで削り取る！[${t}]の守備力をさらに ${diff.toFixed(2)} ポイントダウン！」`,
                (t, diff, cur) => `[解説] 「地味に見えますが、このデバフを欠かさないチームが最終的に巨大な利益を得るんですよね。」`,
                (t, diff, cur) => `[実況] 「防衛陣のスタミナ切れか！[${t}]の防御指数を ${diff.toFixed(2)} 削り落としました！」`
            ],
            perfect: [
                (t) => `[実況] 「もはや無抵抗！[${t}]のセキュリティレベルは限界最小値！ハッカー側のやりたい放題ゾーンです！」`,
                (t) => `[解説] 「[${t}]の防御は完全崩壊ですね。もはや泥棒に入ってくださいと言わんばかりの状態です。」`,
                (t) => `[実況] 「完全無欠のハッキングフィールドを展開！[${t}]はこれ以上ないほどに弱りきっています！」`
            ]
        },
        securityRise: [
            (t, diff, cur) => `[実況] 「あっと！ハッキング活動の反動！[${t}]のセキュリティが ${diff.toFixed(2)} ポイント跳ね上がった（現在: ${cur.toFixed(2)}）！」`,
            (t, diff, cur) => `[解説] 「少々強引に攻めすぎましたね。[${t}]の侵入検知センサーが真っ赤に激怒しています。」`,
            (t, diff, cur) => `[実況] 「[${t}]の防衛システムが自動カウンターパッチを適用！防御レベルは ${cur.toFixed(2)} へと急上昇！」`,
            (t, diff, cur) => `[解説] 「これはお仕置きタイムに入りつつありますね。そろそろうまく頭を冷やす必要があります。」`,
            (t, diff, cur) => `[実況] 「警告赤ランプがコンソールを埋め尽くす！[${t}]のセキュリティがさらに ${diff.toFixed(2)} アップ！」`
        ],
        generic: [
            () => `[実況] 「静寂の時……。各サーバー、不気味なほどの静けさを保っています。」`,
            () => `[解説] 「裏で並行して動作している各スレッド（Threads）が、次の一手の装填を急いでいる段階でしょう。」`,
            () => `[実況] 「実況席の私も、どの画面を見ていいか分からないほどのスピード感！これぞネットランのアリーナ！」`,
            () => `[解説] 「（コーヒーをすすりながら）お互いの手の内の探り合い。チェスで言うなら駒を並べ替えている時間ですね。」`,
            () => `[実況] 「コンパイラの冷却ファンが悲鳴を上げて回っています！次のビッグパケットはどこから放たれるのか！」`,
            () => `[解説] 「これだけ多くのサーバーを同時にハックするなんて、我々の時代では考えられませんでしたね。ロマンがあります。」`
        ]
    };

    // ユーティリティ関数: ランダム選択
    const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

    let noChangeCounter = 0;

    // メイン監視ループ
    while (true) {
        await ns.sleep(300); // 0.3秒おきに各ターゲットの状態変化を高速スキャン

        let stateChanged = false;

        for (const target of targets) {
            const state = serverStates[target];
            const currentMoney = ns.getServerMoneyAvailable(target);
            const currentSec = ns.getServerSecurityLevel(target);

            // 1. 資金の変動をチェック
            if (currentMoney !== state.lastMoney) {
                const diff = currentMoney - state.lastMoney;
                stateChanged = true;

                if (diff < 0) {
                    // ハックされた（減少）
                    const lostAmt = Math.abs(diff);
                    const lostPct = ((lostAmt / (state.lastMoney || 1)) * 100).toFixed(1);

                    if (lostPct > 30) {
                        ns.tprint(getRandom(commentData.hack.critical)(target, lostAmt));
                    } else {
                        ns.tprint(getRandom(commentData.hack.success)(target, lostAmt, lostPct));
                    }
                } else if (diff > 0) {
                    // グロウされた（増加）
                    const growPct = ((diff / (state.lastMoney || 1)) * 100).toFixed(1);
                    ns.tprint(getRandom(commentData.grow.increase)(target, diff, growPct));
                }

                state.lastMoney = currentMoney;
            }

            // 2. セキュリティの変動をチェック
            if (currentSec !== state.lastSec) {
                const diff = state.lastSec - currentSec; // 減少時にプラスになる
                stateChanged = true;

                if (diff > 0) {
                    // ウィークンされた（減少）
                    if (currentSec <= state.minSec + 0.05) {
                        ns.tprint(getRandom(commentData.weaken.perfect)(target));
                    } else {
                        ns.tprint(getRandom(commentData.weaken.decrease)(target, diff, currentSec));
                    }
                } else if (diff < -0.01) {
                    // セキュリティが上昇（HackやGrowの反動などで増加した場合）
                    const riseAmount = Math.abs(diff);
                    ns.tprint(getRandom(commentData.securityRise)(target, riseAmount, currentSec));
                }

                state.lastSec = currentSec;
            }
        }

        if (stateChanged) {
            noChangeCounter = 0;
        } else {
            noChangeCounter++;
            if (noChangeCounter >= 50) {
                ns.tprint(getRandom(commentData.generic)());
                noChangeCounter = 0;
            }
        }
    }
}
