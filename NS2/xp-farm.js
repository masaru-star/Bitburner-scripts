/** @param {NS} ns */
// RAM:2.10GB
export async function main(ns) {
  const target = ns.args[0] || "joesguns";
  while (true) {
    // High security reduces the efficiency of growth, so a little weakening is required.
    if (ns.getServerSecurityLevel(target) > ns.getServerMinSecurityLevel(target) + 2) {
      await ns.weaken(target);
    } else {
      // The main experience source. Grow has a short execution time and can be earned multiple times.
      await ns.grow(target);
    }
  }
}
