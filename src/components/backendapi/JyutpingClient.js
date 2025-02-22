class JyutpingClient {

    constructor(baseUrl = 'https://chinese.eriktamm.com/api') {
    this.baseUrl = baseUrl;
  }

  async getJyutpingDict() {
    try {
      const response = await fetch(`${this.baseUrl}/jyutpingdict`);
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error('Error fetching jyutping dictionary:', error);
      throw error;
    }
  }

  async updateJyutpingPriority(characters) {
    try {
      const response = await fetch(
        `${this.baseUrl}/update_jyutping_dict_prio?characters=${encodeURIComponent(characters)}`,
        {
          method: 'GET'
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error('Error updating jyutping priority:', error);
      throw error;
    }
  }
}

// Usage example:
// const client = new JyutpingClient('http://your-api-url');
// await client.getJyutpingDict();
// await client.updateJyutpingPriority('你好');

export { JyutpingClient };