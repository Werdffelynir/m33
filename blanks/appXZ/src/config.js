

export const config = {
    version: '0.0.0.2',
    date: '251024',
    width: window.innerWidth,
    height: window.innerHeight,
    viewsPath: '/src/views/',
    pluginsPath: '/src/plugins/',
    pluginsList : [
        'VersionInfoPlugin.js',
    ],
    preload: [
        {type: 'image', name: 'picture', url: '/assets/images/picture.png'},
        {type: 'audio', name: 'click1', url: './assets/sounds/click5.mp3'},
        {type: 'json', name: 'demodata', url: '/assets/data/demodata.json'},
    ],
};

