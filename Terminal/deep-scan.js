/** @param {NS} ns */
export async function main(ns) {
  // Sets (to prevent duplication) and arrays to store scan results
  const visited = new Set();
  const serverList = [];
  // Recursive server discovery function
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
    // Get adjacent servers to dive deeper
    const neighbors = ns.scan(hostname);
    for (const next of neighbors) {
      if (!visited.has(next)) {
        scanServer(next, depth + 1);
      }
    }
  }
  scanServer("home", 0);
  // Sort by depth, then by name
  serverList.sort((a, b) => a.depth - b.depth || a.name.localeCompare(b.name));
  // Create text for display
  let output = "--- Network Scan Results ---\n\n";
  output += "Depth | Hostname | Req. Level | RAM | Admin\n";
  output += "------------------------------------------\n";
  for (const s of serverList) {
    output += `[D:${s.depth}] ${s.name.padEnd(18)} | Lvl: ${String(s.reqLevel).padStart(4)} | ${s.ram.toString().padStart(4)}GB | Root: ${s.hasRoot}\n`;
  }
  await ns.alert(output);
}
