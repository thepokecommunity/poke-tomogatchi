import Pokedex from './pokedex.json';

function getDistinctMoves(pokemon) {
  if (Pokedex[pokemon]) {
    let eggMoves = Pokedex[pokemon].egg_moves ? Pokedex[pokemon].egg_moves : [];
    let learnedMoves = getMoveset(pokemon);
    let allMoves = eggMoves.concat(learnedMoves);
    return [...new Set(allMoves)];
  } else {
    console.log(`Pokemon could not be found: ${pokemon}`);
    return [];
  }
}

function getMoveset(pokemon) {
  let learnedMovesObject = Pokedex[pokemon].moveset;
  let learnedMoves = [];
  for (let level in learnedMovesObject) {
    if (Array.isArray(Pokedex[pokemon].moveset[level])) {
      Pokedex[pokemon].moveset[level].forEach(move => {
        learnedMoves.push(move);
      });
    } else {
      learnedMoves.push(Pokedex[pokemon].moveset[level]);
    }
  }
  return learnedMoves;
}

function sortByID(pokemonArray) {
  return pokemonArray.sort((a, b) => a.id - b.id);
}

function removeSelf(pokemonArray, pokemonName) {
  return pokemonArray.filter(pokemon => pokemon.name !== pokemonName);
}

function removeGroup(pokemonArray, pokemonNames) {
  return pokemonArray.filter(pokemon => {
    return !pokemonNames.includes(pokemon.name);
  });
}

function compareArrays(array1, array2, array3 = null, array4 = null) {
  let finalArray = [];
  array1.forEach(element1 => {
    array2.forEach(element2 => {
      if (array3) {
        array3.forEach(element3 => {

          if (array4) {
            array4.forEach(element4 => {
              if (element1 === element2 && element2 === element3 && element3 === element4) {
                finalArray.push(element1);
              }
            });
          } else {
            if (element1 === element2 && element2 === element3) {
              finalArray.push(element1);
            }
          }
        });
      } else {
        if (element1 === element2) {
          finalArray.push(element1);
        }
      }
    });
  });
  return finalArray;
}

export function searchableName(pokemon) {
  return pokemon
    .replace(/\s+/g, '-')
    .replace(/[.,':\s]/g, "")
    .replace(/♀/g, "-f")
    .replace(/♂/g, "-m")
    .toLowerCase();
}


const Search = {

  byEggGroup(eggGroup) {
    let inGroup = [];
    for (let pokemon in Pokedex) {
      if (Pokedex[pokemon].egg_groups[0] === eggGroup || Pokedex[pokemon].egg_groups[1] === eggGroup) {
        inGroup.push(Pokedex[pokemon]);
      }
    }
    return inGroup;
  },

  byMove(move, searchArray = Pokedex) {
    let hasMove = [];
    if (Array.isArray(searchArray)) {
      searchArray.forEach(pokemon => {
        const moves = getDistinctMoves(pokemon.name);
        moves.forEach(moveName => {
          if (moveName.toLowerCase() === move.toLowerCase()) {
            hasMove.push(Pokedex[pokemon.name]);
          }
        });
      })
    } else {
      for (let pokemon in Pokedex) {
        const moves = getDistinctMoves(pokemon);
        moves.forEach(moveName => {
          if (moveName.toLowerCase() === move.toLowerCase()) {
            hasMove.push(Pokedex[pokemon]);
          }
        });
      }
    }
    return hasMove;
  },

  byPokemon(pokemon) {
    for (let pkmn in Pokedex) {
      let name = searchableName(pokemon);
      if (Pokedex[pkmn].name === name) {
        return Pokedex[pkmn];
      }
    }
  },

  byEggAndMove(move = null, eggGroup1, eggGroup2 = null) {
    let byMoves = [];
    if (move) {
      byMoves = Search.byMove(move);
    }
    let byEggGroup = [];
    if (eggGroup2) {
      const byEggGroup1 = Search.byEggGroup(eggGroup1);
      const byEggGroup2 = Search.byEggGroup(eggGroup2);

      byEggGroup = byEggGroup1.filter(pokemon => {
        return byEggGroup2.includes(pokemon);
      });
    } else {
      byEggGroup = Search.byEggGroup(eggGroup1);
    }

    if (!move) {
      return byEggGroup;
    } else {
      return byEggGroup.filter(pokemon => {
        return byMoves.includes(pokemon);
      });
    }
  },

  forEggMoves(move, pokemonName) {
    const relatedPokemonGroup1 = Search.byEggAndMove(move, Pokedex[pokemonName].egg_groups[0]);

    if (Pokedex[pokemonName].egg_groups[1]) {
      const relatedPokemonGroup2 = Search.byEggAndMove(move, Pokedex[pokemonName].egg_groups[1]);

      let combine = relatedPokemonGroup1.concat(relatedPokemonGroup2);
      return sortByID([...new Set(combine)]);

    } else if (Pokedex[pokemonName].egg_groups[0] === "Undiscovered") {
      if (Pokedex[pokemonName].evolutions) {
        let name = searchableName(Pokedex[pokemonName].evolutions[0][0]);
        return Search.forEggMoves(move, name);
      } else {
        return [];
      }
    } else {
      return sortByID(relatedPokemonGroup1);
    }
  },

  isEggChain(move, pokemonName) {
    let entry = Pokedex[pokemonName];
    if (!entry.egg_moves) {
      return false
    }
    let isEggChain = false;
    entry.egg_moves.forEach(moveName => {
      if (moveName === move) {
        isEggChain = true;
        return;
      }
    });
    return isEggChain;
  },

  createQuickestEggChain(move, pokemonName, chain = [], firstPass = true) {
    //Goal: Return an array in order of chain needed
    let moveGroup = Search.forEggMoves(move, pokemonName);

    if (!firstPass) {
      //start incorportating the chains
      chain.push(pokemonName);

      let breedables = removeGroup(moveGroup, chain);
      let continueChain = breedables.filter(pokemon => {
        return Search.isEggChain(move, pokemon.name);
      })
      let endOfChain = breedables.filter(pokemon => {
        return !Search.isEggChain(move, pokemon.name);
      });

      if (endOfChain.length) {
        return [...chain, endOfChain[0].name];
      } else {
        if (continueChain.length) {
          return Search.createQuickestEggChain(move, continueChain[0].name, chain, false);
        }
        else {
          return ["No source found. Either a pokemon in this chain needs to learn it by TM or be have a parent from a previous generation."];
        }
      }
    } else {
      //First Pass
      let breedables = removeSelf(moveGroup, pokemonName);
      let continueChain = breedables.filter(pokemon => {
        return Search.isEggChain(move, pokemon.name);
      })
      let endOfChain = breedables.filter(pokemon => {
        return !Search.isEggChain(move, pokemon.name);
      });

      if (endOfChain.length) {
        return [Pokedex[pokemonName], endOfChain[0]];
      } else {
        //if no pokemon can end the chain, move to the next pokemon in next pass
        return Search.createQuickestEggChain(move, continueChain[0].name, [pokemonName], false);
      }
    }
  },

  createMultiEggChain(moves, pokemonName) {
    //Hard coded to only take 4 moves, not nice but can't find an alternative
    let moveGroups = [];
    moves.forEach(move => {
      moveGroups.push(Search.forEggMoves(move, pokemonName));
    });
    let matches = [];
    switch (moves.length) {
      case 1: matches = moveGroups; break;
      case 2: matches = compareArrays(moveGroups[0], moveGroups[1]); break;
      case 3: matches = compareArrays(moveGroups[0], moveGroups[1], moveGroups[2]); break;
      case 4: matches = compareArrays(moveGroups[0], moveGroups[1], moveGroups[2], moveGroups[3]); break;
      default: matches = moveGroups; break;
    }
    return [...new Set(removeSelf(matches, pokemonName))];
  }
}

export default Search;