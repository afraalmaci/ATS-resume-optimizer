import { redactContactDetails } from '../redact';

describe('redactContactDetails', () => {
  it('removes email addresses', () => {
    expect(redactContactDetails('Mail: jane.doe+cv@example.co.uk')).toBe(
      'Mail: [email]',
    );
  });

  it('removes phone numbers in common formats', () => {
    expect(redactContactDetails('Tel: +31 6 1234 5678')).toBe('Tel: [phone]');
    expect(redactContactDetails('Tel: (0532) 123 45 67')).toBe('Tel: [phone]');
    expect(redactContactDetails('Tel: 06-12345678')).toBe('Tel: [phone]');
  });

  it('removes web links and profile URLs', () => {
    expect(
      redactContactDetails(
        'https://janedoe.dev, www.janedoe.nl, linkedin.com/in/jane, github.com/jane',
      ),
    ).toBe('[link], [link], [link], [link]');
  });

  it('keeps skill names that look like domains', () => {
    const text = 'Node.js, Next.js, ASP.NET Core, Vue.js and C++';
    expect(redactContactDetails(text)).toBe(text);
  });

  it('keeps years, date ranges and other short numbers', () => {
    const text = '2019 - 2021, 3+ years, 20,000 customers, ES6';
    expect(redactContactDetails(text)).toBe(text);
  });
});
