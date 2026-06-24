/** @param {NS} ns */
// RAM:3.80GB
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
  let output = `--- Network Scan Results ---

`;
  output += `Depth | Hostname | Req. Level | RAM | Admin
`;
  output += `------------------------------------------
`;
  for (const s of serverList) {
    output += `[D:${s.depth}] ${s.name.padEnd(18)} | Lvl: ${String(s.reqLevel).padStart(4)} | ${s.ram.toString().padStart(4)}GB | Root: ${s.hasRoot}
`;
  }
  await ns.alert(output);
}
