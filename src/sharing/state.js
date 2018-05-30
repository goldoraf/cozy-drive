const RECEIVE_SHARINGS = 'RECEIVE_SHARINGS'
const ADD_SHARING = 'ADD_SHARING'
const REVOKE_RECIPIENT = 'REVOKE_RECIPIENT'
const REVOKE_SELF = 'REVOKE_SELF'

// actions
export const receiveSharings = data => ({ type: RECEIVE_SHARINGS, data })
export const addSharing = data => ({ type: ADD_SHARING, data })
export const revokeRecipient = (sharing, email) => ({
  type: REVOKE_RECIPIENT,
  sharing,
  email
})
export const revokeSelf = sharing => ({ type: REVOKE_SELF, sharing })

// reducers
const indexSharing = (state = {}, sharing) => {
  return getSharedDocIds(sharing).reduce(
    (byId, id) => ({ ...byId, [id]: [...(byId[id] || []), sharing.id] }),
    state
  )
}
const forgetSharing = (state = {}, sharing) => {
  return getSharedDocIds(sharing).reduce((byId, id) => {
    const { [id]: sharings, ...rest } = byId
    const newSharings = sharings.filter(sid => sid !== sharing.id)
    return newSharings.length === 0 ? rest : { ...rest, [id]: newSharings }
  }, state)
}
const byDocId = (state = {}, action) => {
  switch (action.type) {
    case RECEIVE_SHARINGS:
      return action.data.reduce(
        (byId, sharing) => indexSharing(byId, sharing),
        state
      )
    case ADD_SHARING:
      return indexSharing(state, action.data)
    case REVOKE_SELF:
      return forgetSharing(state, action.sharing)
    default:
      return state
  }
}

const sharings = (state = [], action) => {
  switch (action.type) {
    case RECEIVE_SHARINGS:
      return action.data
    case ADD_SHARING:
      return [...state, action.data]
    case REVOKE_RECIPIENT:
      return state.map(s => {
        return s.id !== action.sharing.id
          ? s
          : {
              ...s,
              attributes: {
                ...s.attributes,
                members: s.attributes.members.filter(
                  m => m.email !== action.email
                )
              }
            }
      })
    case REVOKE_SELF:
      return state.filter(s => s.id !== action.sharing.id)
    default:
      return state
  }
}

const reducer = (state = {}, action = {}) => ({
  byDocId: byDocId(state.byDocId, action),
  sharings: sharings(state.sharings, action)
})
export default reducer

// selectors
export const isOwner = (state, docId) =>
  state.byDocId[docId][0] &&
  getSharingById(state, state.byDocId[docId][0]).attributes.owner === true

export const getOwner = (state, docId) =>
  getRecipients(state, docId).find(r => r.status === 'owner')

export const getRecipients = (state, docId) => {
  const recipients = getDocumentSharings(state, docId)
    .map(sharing => {
      const type = getDocumentSharingType(sharing, docId)
      return sharing.attributes.members.map(m => ({ ...m, type }))
    })
    .reduce((acc, member) => acc.concat(member), [])
  if (recipients[0] && recipients[0].status === 'owner') {
    return [recipients[0], ...recipients.filter(r => r.status !== 'owner')]
  }
  return recipients
}

export const getSharingForRecipient = (state, docId, recipientEmail) =>
  getDocumentSharings(state, docId).find(
    s =>
      s.attributes.members.find(m => m.email === recipientEmail) !== undefined
  )

export const getSharingForSelf = (state, docId) =>
  getDocumentSharings(state, docId)[0]

export const getSharingType = (state, docId) =>
  getDocumentSharingType(getSharingForSelf(state, docId), docId)

const getDocumentSharings = (state, docId) =>
  !state.byDocId[docId]
    ? []
    : state.byDocId[docId].map(id => getSharingById(state, id))

const getSharingById = (state, id) => state.sharings.find(s => s.id === id)

// helpers
const getSharedDocIds = sharing =>
  sharing.attributes.rules
    .map(r => r.values)
    .reduce((acc, val) => acc.concat(val), [])

const getDocumentSharingType = (sharing, docId) => {
  const rule = sharing.attributes.rules.find(
    r => r.values.indexOf(docId) !== -1
  )
  return rule.update === 'sync' && rule.remove === 'sync'
    ? 'two-way'
    : 'one-way'
}
