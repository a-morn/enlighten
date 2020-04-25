import { Server, WebSocket } from 'mock-socket'
const mockServer = new Server('ws://localhost:3000/graphql')

Cypress.Commands.add('mockGraphQL', stubs => {
  cy.on('window:before:load', win => {
    win.WebSocket = WebSocket
    let currentSocket
    mockServer.on('connection', socket => {
      currentSocket = socket
      console.log('Connecte to mock WS')

      currentSocket.on('message', data => {
        return {}
      })
    })
    const indexes = {}
    cy.stub(win, 'fetch', (...args) => {
      console.log('Handling fetch stub', args)
      const [url, request] = args
      if (url.includes('graphql')) {
        const postBody = JSON.parse(request.body)
        const stub = stubs.find(
          ({ operationName }) => postBody.operationName === operationName,
        )
        if (!stub) {
          console.log(
            `Could not find a stub for the operation: ${postBody.operationName}.`,
          )
        } else {
          if (!indexes[stub.operationName]) {
            indexes[stub.operationName] = 0
          }
          const result = JSON.stringify(
            stub.responses[indexes[stub.operationName]],
          )
          indexes[stub.operationName]++
          console.log(indexes)
          console.log(`Mock data: ${result}`)

          if (stub.wsSideEffect) {
            const { delay, payload } = stub.wsSideEffect
            setTimeout(
              () =>
                currentSocket.send(
                  JSON.stringify({ payload, type: 'data', id: 1 }),
                ),
              delay,
            )
            console.log(`wsSideEffect: ${delay}, ${payload}`)
          }
          return Promise.resolve({
            ok: true,
            text() {
              return Promise.resolve(result)
            },
          })
        }
      } else if (url.includes('login-temp-user')) {
        return {
          json: () =>
            Promise.resolve({
              playerId: 'playerId',
              token:
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwbGF5ZXJJZCI6ImU4ODMyMTRhLTUyZDAtNDczNy1iMDc1LTQ5MTU5ZWI0MzdlZiIsImlzVGVtcFVzZXIiOnRydWUsImlhdCI6MTU4NzgyNzY2N30.y6rrymtkZvjarOHcFrzC_krsuCeHYoytDSBokoe_3u8',
            }),
        }
      } else {
        console.log('Unhandled')
      }
    })
  })
})
