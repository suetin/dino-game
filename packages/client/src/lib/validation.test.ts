import { escapeHTML } from './validation'

describe('escapeHTML', () => {
  it('should not modify a safe string', () => {
    const input = 'Обычный текст с пробелами'
    expect(escapeHTML(input)).toBe(input)
  })

  it('should escape <script> tags', () => {
    const input = '<script>alert(1)</script>'
    const expected = '&lt;script&gt;alert(1)&lt;/script&gt;'
    expect(escapeHTML(input)).toBe(expected)
  })

  it('should escape generic HTML tags', () => {
    const input = '<h1>Заголовок</h1>'
    const expected = '&lt;h1&gt;Заголовок&lt;/h1&gt;'
    expect(escapeHTML(input)).toBe(expected)
  })

  it('should escape ampersands', () => {
    const input = 'Tom & Jerry'
    const expected = 'Tom &amp; Jerry'
    expect(escapeHTML(input)).toBe(expected)
  })

  it('should escape double and single quotes', () => {
    const input = `Text with "double" and 'single' quotes`
    const expected = 'Text with &quot;double&quot; and &#39;single&#39; quotes'
    expect(escapeHTML(input)).toBe(expected)
  })

  it('should handle complex combinations', () => {
    const input = ['<img ', 'src="x" ', "onerror='alert(1)' ", '& >'].join('')
    const expected = '&lt;img src=&quot;x&quot; onerror=&#39;alert(1)&#39; &amp; &gt;'
    expect(escapeHTML(input)).toBe(expected)
  })
})
