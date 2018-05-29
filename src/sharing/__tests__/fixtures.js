export const SHARING_1 = {
  type: 'io.cozy.sharings',
  id: 'sharing_1',
  attributes: {
    active: true,
    owner: true,
    description: 'Holidays',
    app_slug: 'drive',
    created_at: '2018-05-21T11:52:19.732097476+02:00',
    updated_at: '2018-05-21T11:52:19.732097476+02:00',
    rules: [
      {
        title: 'Holidays',
        doctype: 'io.cozy.files',
        values: ['folder_1'],
        add: 'sync',
        update: 'sync',
        remove: 'sync'
      }
    ],
    members: [
      {
        status: 'owner',
        name: 'Jane Doe',
        email: 'jane@doe.com',
        instance: 'http://cozy.tools:8080'
      },
      {
        status: 'ready',
        name: 'John Doe',
        email: 'john@doe.com',
        instance: 'http://cozy.local:8080'
      }
    ]
  },
  relationships: {
    shared_docs: {
      data: [
        { id: 'folder_1_1', type: 'io.cozy.files' },
        { id: 'folder_1_2', type: 'io.cozy.files' }
      ]
    }
  }
}

export const SHARING_2 = {
  type: 'io.cozy.sharings',
  id: 'sharing_2',
  attributes: {
    active: true,
    owner: true,
    description: 'Administrative',
    app_slug: 'drive',
    created_at: '2018-05-21T11:52:19.732097476+02:00',
    updated_at: '2018-05-21T11:52:19.732097476+02:00',
    rules: [
      {
        title: 'Administrative',
        doctype: 'io.cozy.files',
        values: ['folder_2'],
        add: 'sync',
        update: 'sync',
        remove: 'sync'
      }
    ],
    members: [
      {
        status: 'owner',
        name: 'Jane Doe',
        email: 'jane@doe.com',
        instance: 'http://cozy.tools:8080'
      },
      {
        status: 'ready',
        name: 'John Doe',
        email: 'john@doe.com',
        instance: 'http://cozy.local:8080'
      }
    ]
  },
  relationships: {
    shared_docs: {
      data: [
        { id: 'folder_2_1', type: 'io.cozy.files' },
        { id: 'folder_2_2', type: 'io.cozy.files' }
      ]
    }
  }
}

export const SHARING_3 = {
  type: 'io.cozy.sharings',
  id: 'sharing_3',
  attributes: {
    active: true,
    owner: true,
    description: 'Holidays',
    app_slug: 'drive',
    created_at: '2018-05-21T11:52:19.732097476+02:00',
    updated_at: '2018-05-21T11:52:19.732097476+02:00',
    rules: [
      {
        title: 'Holidays',
        doctype: 'io.cozy.files',
        values: ['folder_1'],
        add: 'sync',
        update: 'sync',
        remove: 'sync'
      }
    ],
    members: [
      {
        status: 'owner',
        name: 'Jane Doe',
        email: 'jane@doe.com',
        instance: 'http://cozy.tools:8080'
      },
      {
        status: 'pending',
        name: 'Johnny Doe',
        email: 'johnny@doe.com',
        instance: 'http://cozy.foo:8080'
      }
    ]
  },
  relationships: {
    shared_docs: {
      data: [
        { id: 'folder_1_1', type: 'io.cozy.files' },
        { id: 'folder_1_2', type: 'io.cozy.files' }
      ]
    }
  }
}
