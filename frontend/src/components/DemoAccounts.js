import React from 'react';
import { useLocation } from 'react-router-dom';

const accounts = [
  { role: 'Trainer 1', email: 'test@test.com', password: '123456' },
  { role: 'Trainer 2', email: 'test2@test.com', password: '123456' },
  { role: 'Trainee 1', email: 'test3@test.com', password: '123456' },
  { role: 'Trainee 2', email: 'test4@test.com', password: '123456' },
];

export function DemoAccounts() {
  const location = useLocation();
  const [isOpen, setIsOpen] = React.useState(true);
  const [copiedAccount, setCopiedAccount] = React.useState('');

  if (!['/login', '/signup'].includes(location.pathname)) {
    return null;
  }

  function copyCredentials(account) {
    const credentials = `${account.email}\nPassword: ${account.password}`;

    navigator.clipboard.writeText(credentials).then(() => {
      setCopiedAccount(account.email);
      window.setTimeout(() => setCopiedAccount(''), 1600);
    });
  }

  return (
    <aside
      className={`demo-accounts ${isOpen ? 'demo-accounts_open' : ''}`}
      aria-label='Demo accounts'
    >
      <button
        className='demo-accounts__toggle'
        type='button'
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
      >
        <span className='demo-accounts__toggle-icon' aria-hidden='true'>
          {isOpen ? '×' : '↗'}
        </span>
        <span>{isOpen ? 'Close' : 'Try the demo'}</span>
      </button>

      {isOpen && (
        <div className='demo-accounts__panel'>
          <p className='demo-accounts__eyebrow'>Portfolio demo</p>
          <h2 className='demo-accounts__title'>Try a test account</h2>
          <p className='demo-accounts__intro'>
            Choose a trainer or trainee account. They all use password{' '}
            <strong>123456</strong>.
          </p>

          <div className='demo-accounts__list'>
            {accounts.map((account) => (
              <button
                className='demo-accounts__account'
                type='button'
                key={account.email}
                onClick={() => copyCredentials(account)}
                title='Copy login credentials'
              >
                <span>
                  <strong>{account.role}</strong>
                  <small>{account.email}</small>
                </span>
                <span className='demo-accounts__copy'>
                  {copiedAccount === account.email ? 'Copied!' : 'Copy'}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
