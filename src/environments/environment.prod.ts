var isProdBuild = false;
export const environment = {
  production: false,
  url:  isProdBuild ? 'https://pp.logicade.io' : 'https://dev01.pp.logicade.io',
};
