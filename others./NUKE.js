/** @param {NS} ns */
export async function main(ns) {
    // 探索済みサーバーを記録するセット
    const visited = new Set();

    // 再帰的にサーバーを探索してNUKEする関数
    async function networkScan(server) {
        visited.add(server);

        // 自分（home）以外のサーバーに対してハック処理を実行
        if (server !== "home") {
            await breakAndNuke(ns, server);
        }

        // 隣接するサーバーのリストを取得
        const neighbors = ns.scan(server);

        for (const nextServer of neighbors) {
            // まだ訪れていないサーバーであれば奥に進む（深さ優先探索）
            if (!visited.has(nextServer)) {
                await networkScan(nextServer);
            }
        }
    }

    // 探索を開始（起点：home）
    ns.tprint("--- 全自動ハックシステムを起動します ---");
    await networkScan("home");
    ns.tprint("--- すべてのサーバーのハック処理が完了しました ---");
}

/** * ポートを開放し、NUKEを実行する関数
 * @param {NS} ns 
 * @param {string} server 
 */
async function breakAndNuke(ns, server) {
    // 既にroot権限を持っている場合はスルー
    if (ns.hasRootAccess(server)) {
        return;
    }

    let openPorts = 0;

    // 各種EXEを所持しているか確認し、持っていれば実行
    if (ns.fileExists("BruteSSH.exe", "home")) {
        ns.brutessh(server);
        openPorts++;
    }
    if (ns.fileExists("FTPCrack.exe", "home")) {
        ns.ftpcrack(server);
        openPorts++;
    }
    if (ns.fileExists("relaySMTP.exe", "home")) {
        ns.relaysmtp(server);
        openPorts++;
    }
    if (ns.fileExists("HTTPWorm.exe", "home")) {
        ns.httpworm(server);
        openPorts++;
    }
    if (ns.fileExists("SQLInject.exe", "home")) {
        ns.sqlinject(server);
        openPorts++;
    }

    // NUKEに必要なポート数を満たしているか確認
    const portsRequired = ns.getServerNumPortsRequired(server);
    
    if (openPorts >= portsRequired) {
        ns.nuke(server);
        ns.tprint(`[SUCCESS] ${server} のroot権限を取得しました。`);
    } else {
        // スキル不足やEXEが足りない場合はログに残す（tprintだと画面が埋まるので低レベルログに）
        ns.print(`[SKIP] ${server} はポート開放ツールが足りません (必要: ${portsRequired}, 所持: ${openPorts})`);
    }
}
