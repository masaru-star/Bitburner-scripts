/** @param {NS} ns **/
// RAM:1.80GB
export async function main(ns) {
  const target = ns.args[0];
  if (!target) {
    ns.tprint("Usage: run path.js [server name]");
    return;
  }

  let path = [target];

  // Follow the parent tree from the target server until you reach 'home'
  // The first element of ns.scan() is always the "parent server"
  while (path[0] !== "home") {
    let parent = ns.scan(path[0])[0];
    path.unshift(parent);
  }

  // Display the connection command in the terminal
  await ns.alert("\n" + path.map(server => `connect ${server}`).join("; "));
}
export function autocomplete(data, args) {
  return data.servers;
}
