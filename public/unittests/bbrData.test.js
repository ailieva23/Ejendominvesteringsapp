const { bbrData } = require('../bbr');

const mockData = [
    {
        enh023Boligtype: 'Etagebolig',
        byggeår: 1987,
        enh027ArealTilBeboelse: 95,
        enh031AntalVærelser: 4,
        enh026EnhedensSamledeAreal: 300,
    }
];

// tester om boligtype bliver returneret korrekt.
test('bbrData returnerer boligtype korrekt', () => {
    const result = bbrData(mockData);
    expect(result.boligtype).toBe('Etagebolig');
});

// tester om "Fallback" logikken virker.
test('bbrData returnerer "Ukendt" når boligtype mangler', () => {
    const result = bbrData([{}]);
    expect(result.boligtype).toBe('Ukendt');
});

// tester om "||" logikken virker.
test('bbrData bruger enh028 når enh027 mangler', () => {
    const result = bbrData([{ enh028ArealTilErhverv: 80 }]);
    expect(result.boligareal).toBe(80);
});

// tester om koden kan hånterer null og undefined input.
test('bbrData håndterer null-værdier i felter', () => {
    const result = bbrData([{ enh023Boligtype: null }]);
    expect(result.boligtype).toBe('Ukendt');
});

// tester om byggeår bliver returneret korrekt.
test('bbrData returnerer byggeår korrekt', () => {
    const result = bbrData(mockData);
    expect(result.byggeår).toBe(1987);
});


