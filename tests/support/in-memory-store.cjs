class InMemoryStore {
  constructor(initialEntries = []) {
    this.values = new Map(initialEntries);
    this.readCount = 0;
    this.writeCount = 0;
    this.failRead = false;
    this.failWrite = false;
    this.readDelayMs = 0;
    this.writeDelayMs = 0;
  }

  async getItem(key) {
    this.readCount += 1;
    if (this.readDelayMs > 0) await delay(this.readDelayMs);
    if (this.failRead) throw new Error('fake read failure');
    return this.values.has(key) ? this.values.get(key) : null;
  }

  async setItem(key, value) {
    this.writeCount += 1;
    if (this.writeDelayMs > 0) await delay(this.writeDelayMs);
    if (this.failWrite) throw new Error('fake write failure');
    this.values.set(key, value);
  }

  read(key) {
    return this.values.has(key) ? this.values.get(key) : null;
  }

  write(key, value) {
    this.values.set(key, value);
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = { InMemoryStore };
