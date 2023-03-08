import { v4 } from 'uuid'
import { db } from './client'
import { AppSchema } from './schema'
import { now } from './util'

export async function createCharacter(
  userId: string,
  char: Pick<
    AppSchema.Character,
    'name' | 'avatar' | 'persona' | 'sampleChat' | 'greeting' | 'scenario'
  >
) {
  const newChar: AppSchema.Character = {
    _id: v4(),
    kind: 'character',
    userId,
    createdAt: now(),
    updatedAt: now(),
    ...char,
  }

  await db('character').insertOne(newChar)
  return newChar
}

export async function updateCharacter(
  id: string,
  userId: string,
  char: Pick<
    AppSchema.Character,
    'name' | 'avatar' | 'persona' | 'sampleChat' | 'greeting' | 'scenario'
  >
) {
  const edit = { ...char, updatedAt: now() }
  if (edit.avatar === undefined) {
    delete edit.avatar
  }
  await db('character').updateOne({ _id: id, userId, kind: 'character' }, { $set: edit })
  return getCharacter(userId, id)
}

export async function getCharacter(userId: string, id: string) {
  const char = await db('character').findOne({ kind: 'character', _id: id, userId })
  return char
}

export async function getCharacters(userId: string) {
  const list = await db('character').find({ kind: 'character', userId }).toArray()
  return list
}

export async function deleteCharacter(charId: string, userId: string) {
  await db('character').deleteOne({ _id: charId, userId, kind: 'character' }, {})
}

export async function getCharacterList(charIds: string[]) {
  const list = await db('character')
    .find({ _id: { $in: charIds }, kind: 'character' })
    .toArray()
  return list
}
