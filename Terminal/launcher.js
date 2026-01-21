/** @param {NS} ns */
// RAM:3.15GB
export async function main(ns) {
  // 1. Settings: Script name and target server to run
  const scriptName = ns.args[0]||"hack.js"; // The name of the script you want to run
  const hostServer = ns.getHostname();
  // 2. Get memory information
  const maxRam = ns.getServerMaxRam(hostServer);
  const usedRam = ns.getServerUsedRam(hostServer);
  const scriptRam = ns.getScriptRam(scriptName);

  // 3. Calculating free memory (usedRam includes the memory used by the launcher itself)
  const freeRam = maxRam - usedRam;

  // 4. Calculating the number of threads (rounding down)
  const threads = Math.floor(freeRam / scriptRam);
  if (threads > 0) {
    ns.tprint(`server: ${hostServer}`);
    ns.tprint(`Launches ${scriptName} in ${threads} threads.`);
    ns.exec(scriptName, hostServer, threads);
  } else {
    ns.tprint("Error: Not enough free memory to launch script.");
  }
}
