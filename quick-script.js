/** @param {NS} ns */
export async function main(ns) {
    const fileList = [
        {
            filename: "scripts/NUKE.js",
            content: `
/** @param {NS} ns */
export async function main(ns) {
    const visited = new Set();
    async function networkScan(server) {
        visited.add(server);
        if (server !== "home") {
            await breakAndNuke(ns, server);
        }
        const neighbors = ns.scan(server);
        for (const nextServer of neighbors) {
            if (!visited.has(nextServer)) {
                await networkScan(nextServer);
            }
        }
    }
    ns.tprint("------");
    await networkScan("home");
    ns.tprint("------");
}
async function breakAndNuke(ns, server) {
    if (ns.hasRootAccess(server)) {
        return;
    }
    let openPorts = 0;
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
    const portsRequired = ns.getServerNumPortsRequired(server);
  
    if (openPorts >= portsRequired) {
        ns.nuke(server);
        ns.tprint(\`[SUCCESS] \${server} のroot権限を取得しました。\`);
    } else {
        ns.print(\`[SKIP] \${server} はポート開放ツールが足りません (必要: \${portsRequired}, 所持: \${openPorts})\`);
    }
}`
        },
        {
            filename: "scripts/xp-farm.js",
            content: `
/** @param {NS} ns */
export async function main(ns) {
  const target = ns.args[0] || "joesguns";
  while (true) {
    if (ns.getServerSecurityLevel(target) > ns.getServerMinSecurityLevel(target) + 2) {
      await ns.weaken(target);
    } else {
      await ns.grow(target);
    }
  }
}`
        },
        {
            filename: "scripts/deep-scan.js",
            content: `
/** @param {NS} ns */
export async function main(ns) {
  const visited = new Set();
  const serverList = [];
  function scanServer(hostname, depth) {
    visited.add(hostname);
    if (hostname !== "home") {
      const server = ns.getServer(hostname);
      serverList.push({
        name: hostname,
        depth: depth,
        reqLevel: server.requiredHackingSkill,
        ram: server.maxRam,
        hasRoot: server.hasAdminRights ? "YES" : "NO"
      });
    }
    const neighbors = ns.scan(hostname);
    for (const next of neighbors) {
      if (!visited.has(next)) {
        scanServer(next, depth + 1);
      }
    }
  }
  scanServer("home", 0);
  serverList.sort((a, b) => a.depth - b.depth || a.name.localeCompare(b.name));
  let output = \`--- Network Scan Results ---\n\n\`;
  output += \`Depth | Hostname | Req. Level | RAM | Admin\n\`;
  output += \`------------------------------------------\n\`;
  for (const s of serverList) {
    output += \`[D:\${s.depth}] \${s.name.padEnd(18)} | Lvl: \${String(s.reqLevel).padStart(4)} | \${s.ram.toString().padStart(4)}GB | Root: \${s.hasRoot}\n\`;
  }
  await ns.alert(output);
}`
        },
        {
            filename: "scripts/deploy-farm.js",
            content: `
/** @param {NS} ns */
export async function main(ns) {
    const targetScript = "xp-farm.js";
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
    ns.tprint(\`[INFO] 発見された総サーバー数: \${allServers.length}\`);
    for (const server of allServers) {
        if (!ns.hasRootAccess(server)) {
            continue;
        }
        const scriptRam = ns.getScriptRam(targetScript, "home");
        if (scriptRam === 0) {
            ns.tprint(\`[ERROR] \${targetScript} が home に存在しないか、RAMが0です。\`);
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
            ns.tprint(\`[SUCCESS] \${server} で \${threads} スレッド実行します。\`);
            ns.exec(targetScript, server, threads);
        } else {
            ns.tprint(\`[WARNING] \${server} はRAMが足りないためスキップしました（空きRAM: \${availableRam}GB）。\`);
        }
    }
}`
        },
        {
            filename: "scripts/find-server.js",
            content: `
/** @param {NS} ns **/
export async function main(ns) {
  const target = ns.args[0];
  if (!target) {
    ns.tprint("Usage: run path.js [サーバー名]");
    return;
  }
  let path = [target];
  while (path[0] !== "home") {
    let parent = ns.scan(path[0])[0];
    path.unshift(parent);
  }
  await ns.alert("\n" + path.map(server => \`connect \${server}\`).join("; "));
}
export function autocomplete(data, args) {
  return data.servers;
}`
        },
        {
            filename: "scripts/sample.txt",
            content: `
Hello world!
I feel like I'm forever wandering around BitNode-1.`
        }
    ];
    function interpolate(template, context) {
      return new Function(...Object.keys(context), `return \`\${template}\`;`)(...Object.values(context));
    }
    const newList = fileList.map(item => ({
      ...item,
      content: item.content.replace(/\\`/g, '`')
    }));
    for (const file of fileList) {
        ns.write(file.filename, file.content, "w");
        ns.tprintf(`Created: ${file.filename}`);
    }
}
