/** @param {NS} ns */
export async function main(ns) {
    // 発見したサーバーを重複なく管理するSet
    const allServers = new Set();

    // 1. ネットワーク上の全サーバーを再帰的に走査してリストアップする関数
    function scanNetwork(current) {
        allServers.add(current);
        
        // 現在のサーバーから接続されている隣接サーバーを取得
        let neighbors = ns.scan(current);
        for (let neighbor of neighbors) {
            // まだリストに登録されていないサーバーがあれば、そこへ潜入してさらにスキャン
            if (!allServers.has(neighbor)) {
                scanNetwork(neighbor);
            }
        }
    }

    ns.tprint("=== 全サーバーの完全スキャンを開始します ===");
    
    // homeから開始して全サーバーを網羅
    scanNetwork("home");

    let totalCopied = 0;
    let totalFound = 0;

    // 2. 集めた全サーバーのリストからファイルを走査
    for (let server of allServers) {
        if (server === "home") continue; // home自身はスキップ

        let files = ns.ls(server);
        let litFiles = files.filter(file => file.endsWith(".lit"));

        for (let file of litFiles) {
            totalFound++;
            // homeにまだないファイル、またはサイズが異なる（念のため）ファイルをコピー
            if (!ns.fileExists(file, "home")) {
                ns.tprint(`[コピー] ${server} -> ${file}`);
                await ns.scp(file, "home", server);
                totalCopied++;
            }
        }
    }

    ns.tprint("--------------------------------------------------");
    ns.tprint(`走査完了: ネットワーク上で計 ${totalFound} 個の .lit ファイルを検出`);
    ns.tprint(`新しく home にコピーした数: ${totalCopied} 個`);
    ns.tprint("=== 処理が終了しました ===");
}
