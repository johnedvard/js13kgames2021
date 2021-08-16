/*
 * This is an example of an AssemblyScript smart contract with two simple,
 * symmetric functions:
 *
 * 1. setGreeting: accepts a greeting, such as "howdy", and records it for the
 *    user (account_id) who sent the request
 * 2. getGreeting: accepts an account_id and returns the greeting saved for it,
 *    defaulting to "Hello"
 *
 * Learn more about writing NEAR smart contracts with AssemblyScript:
 * https://docs.near.org/docs/roles/developer/contracts/assemblyscript
 *
 */

import { Context, logging, storage, AVLTree } from 'near-sdk-as';

const scoreMaps: AVLTree<string, AVLTree<string, string>> = new AVLTree<
  string,
  AVLTree<string, string>
>('levels');
const DEFAULT_MESSAGE = 'halla';

// Exported functions will be part of the public interface for your smart contract.
// Feel free to extract behavior to non-exported functions!
export function getGreeting(accountId: string): string | null {
  // This uses raw `storage.get`, a low-level way to interact with on-chain
  // storage for simple contracts.
  // If you have something more complex, check out persistent collections:
  // https://docs.near.org/docs/roles/developer/contracts/assemblyscript#imports
  return storage.get<string>(accountId, DEFAULT_MESSAGE);
}

export function setGreeting(message: string): void {
  const account_id = Context.sender;

  // Use logging.log to record logs permanently to the blockchain!
  logging.log(
    // String interpolation (`like ${this}`) is a work in progress:
    // https://github.com/AssemblyScript/assemblyscript/pull/1115
    'Saving greeting "' + message + '" for account "' + account_id + '"'
  );

  storage.set(account_id, message);
}

/**
 * need to strongifyJson before calling this
 * @param levelName
 * @param accountId
 * @param json {score: string, name: string}
 */
export function setScore(levelName: string, json: string): void {
  const accountId = Context.sender;
  if (!scoreMaps.has(levelName)) {
    const newMap = new AVLTree<string, string>(levelName);
    newMap.set(accountId, json);
    scoreMaps.set(levelName, newMap);
  } else {
    const existingMap = scoreMaps.get(levelName);
    if (existingMap) existingMap.set(accountId, json);
  }
}

export function getScores(levelName: string): AVLTree<string, string> | null {
  if (scoreMaps.has(levelName)) {
    return scoreMaps.get(levelName);
  }
  return null;
}

export function getScore(levelName: string, accountId: string): string | null {
  if (scoreMaps.has(levelName)) {
    const score = scoreMaps.get(levelName);
    if (score) return score.get(accountId, null);
  }
  return null;
}
