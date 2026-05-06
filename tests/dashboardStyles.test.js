const { css } = require('../src/dashboardStyles');

describe('dashboardStyles', () => {
  it('exports a non-empty css string', () => {
    expect(typeof css).toBe('string');
    expect(css.length).toBeGreaterThan(50);
  });

  it('contains method colour classes', () => {
    expect(css).toContain('.method-get');
    expect(css).toContain('.method-post');
    expect(css).toContain('.method-put');
    expect(css).toContain('.method-patch');
    expect(css).toContain('.method-delete');
  });

  it('sets dark background on body', () => {
    expect(css).toContain('background');
    expect(css).toContain('#0f1117');
  });

  it('contains table styles', () => {
    expect(css).toContain('table');
    expect(css).toContain('border-collapse');
  });
});
