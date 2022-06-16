//Project Chapter 7

var roads = [
  "Alice's House-Bob's House",   "Alice's House-Cabin",
  "Alice's House-Post Office",   "Bob's House-Town Hall",
  "Daria's House-Ernie's House", "Daria's House-Town Hall",
  "Ernie's House-Grete's House", "Grete's House-Farm",
  "Grete's House-Shop",          "Marketplace-Farm",
  "Marketplace-Post Office",     "Marketplace-Shop",
  "Marketplace-Town Hall",       "Shop-Town Hall"
];

function buildGraph(edges) {
  let graph = Object.create(null);
  function addEdge(from, to) {
    if (graph[from] == null) {
      graph[from] = [to];
    } else {
      graph[from].push(to);
    }
  }
  for (let [from, to] of edges.map(r => r.split("-"))) {
    addEdge(from, to);
    addEdge(to, from);
  }
  return graph;
}

var roadGraph = buildGraph(roads);

var VillageState = class VillageState {
  constructor(place, parcels) {
    this.place = place;
    this.parcels = parcels;
  }

  move(destination) {
    if (!roadGraph[this.place].includes(destination)) {
      return this;
    } else {
      let parcels = this.parcels.map(p => {
        if (p.place != this.place) return p;
        return {place: destination, address: p.address};
      }).filter(p => p.place != p.address);
      return new VillageState(destination, parcels);
    }
  }
}

function runRobot(state, robot, memory) {
  for (let turn = 0;; turn++) {
    if (state.parcels.length == 0) {
      console.log(`Done in ${turn} turns`);
      break;
    }
    let action = robot(state, memory);
    state = state.move(action.direction);
    memory = action.memory;
    console.log(`Moved to ${action.direction}`);
  }
}

function randomPick(array) {
  let choice = Math.floor(Math.random() * array.length);
  return array[choice];
}

function randomRobot(state) {
  return {direction: randomPick(roadGraph[state.place])};
}

VillageState.random = function(parcelCount = 5) {
  let parcels = [];
  for (let i = 0; i < parcelCount; i++) {
    let address = randomPick(Object.keys(roadGraph));
    let place;
    do {
      place = randomPick(Object.keys(roadGraph));
    } while (place == address);
    parcels.push({place, address});
  }
  return new VillageState("Post Office", parcels);
};

var mailRoute = [
  "Alice's House", "Cabin", "Alice's House", "Bob's House",
  "Town Hall", "Daria's House", "Ernie's House",
  "Grete's House", "Shop", "Grete's House", "Farm",
  "Marketplace", "Post Office"
];

function routeRobot(state, memory) {
  if (memory.length == 0) {
    memory = mailRoute;
  }
  return {direction: memory[0], memory: memory.slice(1)};
}

function findRoute(graph, from, to) {
  let work = [{at: from, route: []}];
  for (let i = 0; i < work.length; i++) {
    let {at, route} = work[i];
    for (let place of graph[at]) {
      if (place == to) return route.concat(place);
      if (!work.some(w => w.at == place)) {
        work.push({at: place, route: route.concat(place)});
      }
    }
  }
}

function goalOrientedRobot({place, parcels}, route) {
  if (route.length == 0) {
    let parcel = parcels[0];
    if (parcel.place != place) {
      route = findRoute(roadGraph, place, parcel.place);
    } else {
      route = findRoute(roadGraph, place, parcel.address);
    }
  }
  return {direction: route[0], memory: route.slice(1)};
}

//Task1 - Measuring a robot

function measure(state, robot, memory) {
  for (let steps = 0;; steps++) {
    if (state.parcels.length == 0) return steps;
    let next_step = robot(state, memory);
    state = state.move(next_step.direction);
    memory = next_step.memory;
  }
}

function compareRobots(robot1, memory1, robot2, memory2) {
  let steps1 = 0;
  let steps2 = 0;
  for (let i = 0; i < 100; i++) {
    let state = VillageState.random();
    steps1 += measure(state, robot1, memory1);
    steps2 += measure(state, robot2, memory2);
  }
  console.log('TASK 1: MEASURING A ROBOT')
  console.log('Steps per task:')
  console.log('Robot 1 - ' + steps1 / 100)
  console.log('Robot 2 - ' + steps2 / 100)
}

compareRobots(routeRobot, [], goalOrientedRobot, []);

//Task3 - Persistent group

class PGroup {
  constructor(elements) {
    this.elements = elements;
  }

  add(element) {
    if (this.has(element)) return this;
    return new PGroup(this.elements.concat([element]));
  }

  delete(element) {
    if (!this.has(element)) return this;
    return new PGroup(this.elements.filter(value => value !== element));
  }

  has(element) {
    return this.elements.includes(element);
  }
}

PGroup.empty = new PGroup([]);

let apple = PGroup.empty.add("apple");
let apple_orange = apple.add("orange");
let orange = apple_orange.delete("apple");

console.log(apple_orange.has('orange'))
console.log(apple.has('orange'))
console.log(apple.has('apple'))
console.log(orange.has('orange'))
console.log(apple_orange.has('apple'))
console.log(orange.has('apple'))
