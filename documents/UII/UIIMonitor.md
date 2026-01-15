

```js

const monitor1 = this.uii.create(UIIMonitor, 'monitor1', {
    x: 500,
    y: 10,
    width: 400,
    height: 100,
    fixed: true,
    style: {
        border: '2px solid #246',
        color: '#af3',
        padding: '10px',
        fontSize: '12px',
    },
})
monitor1.alignment({
    justify: {end: true},
    align: {end: true},
    text: {start: true}
})
const rd_words = [
    'the action or process of reconstructing or being reconstructed.\n',
    'Permission is hereby granted',
    'free of charge',
    'to any person obtaining',
    'software and associated documentation',
    'to use, copy, modify, merge, publish, distribute, sublicense',
    'following conditions',
]
this.monTimer = Ut.timer(t=> {
    monitor1.append(Ut.randomOne(rd_words))
}, 500);
this.monTimer.start()


```

