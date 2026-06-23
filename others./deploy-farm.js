/** @param {NS} ns */
export async function main(ns) {
    const targetScript = "xp-farm.js";

    // 1. 全てのサーバー名を再帰的に取得する関数
    function getAllServers() {
        const servers = new Set(["home"]);
        const queue = ["home"];

        while (queue.length > 0) {
            const current = queue.shift();
            const connections = ns.scan(current);

            for (const next of connections) {
                if (!servers.has(next)) {
                    servers.add(next);
                    queue.push(next);
                }
            }
        }
        return Array.from(servers);
    }

    const allServers = getAllServers();
    ns.tprint(`[INFO] 発見された総サーバー数: ${allServers.length}`);

    // 2. 各サーバーにスクリプトを配って実行
    for (const server of allServers) {
        // Root権限がない場合はスキップ
        if (!ns.hasRootAccess(server)) {
            continue;
        }

        // スクリプトの必要RAMを取得
        const scriptRam = ns.getScriptRam(targetScript, "home");
        if (scriptRam === 0) {
            ns.tprint(`[ERROR] ${targetScript} が home に存在しないか、RAMが0です。`);
            return;
        }
        if (server !== "home") {
            if (ns.scriptRunning(targetScript, server)) {
                ns.scriptKill(targetScript, server);
            }
            
            await ns.scp(targetScript, server, "home");
        }

        const maxRam = ns.getServerMaxRam(server);
        const usedRam = ns.getServerUsedRam(server);
        let availableRam = maxRam - usedRam;
        if (server !== "home") {
            availableRam = maxRam; 
        }
        const threads = Math.floor(availableRam / scriptRam);

        if (threads > 0) {
            ns.tprint(`[SUCCESS] ${server} で ${threads} スレッド実行します。`);
            ns.exec(targetScript, server, threads);
        } else {
            ns.tprint(`[WARNING] ${server} はRAMが足りないためスキップしました（空きRAM: ${availableRam}GB）。`);
        }
    }
}
