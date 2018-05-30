import reducer, {
  receiveSharings,
  addSharing,
  getRecipients,
  revokeRecipient,
  revokeSelf
} from '../state'

import { SHARING_1, SHARING_2, SHARING_3 } from './fixtures'

describe('Sharing state', () => {
  it('should have a default state', () => {
    const state = reducer()
    expect(state).toEqual({ byDocId: {}, sharings: [] })
  })

  it('should index received sharings', () => {
    const state = reducer(undefined, receiveSharings([SHARING_1, SHARING_2]))
    expect(state.byDocId).toEqual({
      folder_1: [SHARING_1.id],
      folder_2: [SHARING_2.id]
    })
    expect(state.sharings).toEqual([SHARING_1, SHARING_2])
  })

  it('should index a newly created sharing', () => {
    const initialState = reducer(
      undefined,
      receiveSharings([SHARING_1, SHARING_2])
    )
    const newState = reducer(initialState, addSharing(SHARING_3))
    expect(newState.byDocId).toEqual({
      folder_1: [SHARING_1.id, SHARING_3.id],
      folder_2: [SHARING_2.id]
    })
    expect(newState.sharings).toEqual([SHARING_1, SHARING_2, SHARING_3])
  })

  it('should revoke a recipient', () => {
    const state = reducer(
      reducer(undefined, receiveSharings([SHARING_1, SHARING_2])),
      revokeRecipient(SHARING_1, 'john@doe.com')
    )
    expect(state.sharings[0].attributes.members).toHaveLength(1)
  })

  it('should revoke self', () => {
    const state = reducer(
      reducer(undefined, receiveSharings([SHARING_1, SHARING_2])),
      revokeSelf(SHARING_1)
    )
    expect(state.byDocId).toEqual({
      folder_2: [SHARING_2.id]
    })
  })

  describe('selectors', () => {
    const state = reducer(
      reducer(undefined, receiveSharings([SHARING_1, SHARING_2])),
      addSharing(SHARING_3)
    )

    it('should list all sharing recipients for a doc', () => {
      expect(getRecipients(state, 'folder_1')).toEqual([
        {
          email: 'jane@doe.com',
          instance: 'http://cozy.tools:8080',
          name: 'Jane Doe',
          status: 'owner',
          type: 'two-way'
        },
        {
          email: 'john@doe.com',
          instance: 'http://cozy.local:8080',
          name: 'John Doe',
          status: 'ready',
          type: 'two-way'
        },
        {
          email: 'johnny@doe.com',
          instance: 'http://cozy.foo:8080',
          name: 'Johnny Doe',
          status: 'pending',
          type: 'two-way'
        }
      ])
    })
  })
})
