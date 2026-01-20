/** @param {NS} ns */
// RAM:2.30GB
export async function main(ns) {
  const targets = [
    "n00dles",
    "foodnstuff",
    "joesguns"
  ];
  const securityThresholdOffset = 3;

  while (true) {
    for (const target of targets) {
      let currentSec = ns.getServerSecurityLevel(target);
      let minSec = ns.getServerMinSecurityLevel(target);
      let currentMoney = ns.getServerMoneyAvailable(target);

      if (currentSec > minSec + securityThresholdOffset) {
        ns.print(`Action: Weaken - Security is too high!`);
        await ns.weaken(target);
      } else if (currentMoney > 0) {
        ns.print(`Action: Hack - Conditions met.`);
        await ns.hack(target);
      } else {
        ns.print(`Action: Grow - Server is empty.`);
        await ns.grow(target);
      }
    }
    await ns.sleep(50);
  }
}
