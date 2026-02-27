import '@testing-library/jest-dom';

// Mock Chrome API
global.chrome = {
  storage: {
    local: {
      get: vi.fn((keys, callback) => {
        if (callback) callback({});
        return Promise.resolve({});
      }),
      set: vi.fn((items, callback) => {
        if (callback) callback();
        return Promise.resolve();
      }),
      remove: vi.fn((keys, callback) => {
        if (callback) callback();
        return Promise.resolve();
      })
    }
  },
  runtime: {
    lastError: null,
    sendMessage: vi.fn()
  },
  tabs: {
    query: vi.fn(),
    sendMessage: vi.fn()
  }
};
