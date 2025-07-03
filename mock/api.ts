export default [
  {
    url: '/api/infos',
    method: 'GET',
    response: ({ query }) => {
      return {
        code: 0,
        msg: 'success',
        data: {
          name: 'vite-react-template',
          version: '0.0.0'
        }
      }
    }
  }
]