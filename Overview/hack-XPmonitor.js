/** @param {NS} ns */
// RAM:6.10GB
export async function main(ns) {
    const doc = eval("document");
    const hook0 = doc.getElementById('overview-extra-hook-0');
    const hook1 = doc.getElementById('overview-extra-hook-1');
    ns.atExit(() => {
        hook0.innerText = "";
        hook1.innerText = "";
    });
    let lastExp = ns.getHasher ? ns.formulas.skills.getSkillLevel(ns.getPlayer().skills.hacking) : ns.getPlayer().exp.hacking;
    while (true) {
        // Get current hacking experience
        let currentExp = ns.getPlayer().exp.hacking;
        // Calculate the increase per second
        let expGain = currentExp - lastExp;
        lastExp = currentExp;
        // Show in Sidebar
        try {
            hook0.innerText = "Hack Exp/s";
            hook1.innerText = `${ns.formatNumber(expGain, 2)}`;
        } catch (e) {
            ns.print("HUD update failed: " + e);
        }

        await ns.sleep(1000);
    }
}
