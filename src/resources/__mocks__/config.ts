const config = {
  wegmans: {
      paths: {
          baseUrl: 'defaultBaseUrl'
      },
      username: 'defaultUsername',
      password: 'defaultPassword'
  }
};

export default {
    get(key:string):any {
        // @ts-ignore
        return config[key];
    }
}