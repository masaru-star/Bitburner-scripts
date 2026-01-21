/** @param {NS} ns */
// RAM:2.00GB
export async function main(ns) {
  const targetName = ns.args[0]||"hack.js"; // If no argument is given, the default name
  const servers = new Set(["home"]);
  function scan(current) {
    let connections = ns.scan(current);
    for (let server of connections) {
      if (!servers.has(server)) {
        servers.add(server);
        scan(server);
      }
    }
  }
  scan("home");
  let report = `--- Search Result: [${targetName}] ---\n\n`;
  let totalThreads = 0;
  let foundAny = false;
  for (const server of servers) {
    const processes = ns.ps(server);
    const targets = processes.filter(p => p.filename === targetName);

    if (targets.length > 0) {
      foundAny = true;
      const serverThreads = targets.reduce((sum, p) => sum + p.threads, 0);
      report += `📍 ${server.padEnd(18)} : ${serverThreads} threads\n`;
      totalThreads += serverThreads;
    }
  }
  if (!foundAny) {
    report += `The specified script is not running in the network.`;
  } else {
    report += "--------------------------------------\n";
    report += `TOTAL THREADS : ${totalThreads}`;
  }
  ns.alert(report);
}
