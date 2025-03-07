class CategoriesService {
    constructor(apiClient) {
        this.apiClient = apiClient;
        this.baseUrl = 'https://api.kick.com/public/v1/categories';
    }

    async getCategories(searchQuery = '', token = '') {
        const url = new URL(this.baseUrl);
        if (searchQuery) {
            url.searchParams.append('q', searchQuery);
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                ...(token && { Authorization: `Bearer ${token}` })
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }

    async getCategory(categoryId, token = '') {
        const response = await fetch(`${this.baseUrl}/${categoryId}`, {
            method: 'GET',
            headers: {
                ...(token && { Authorization: `Bearer ${token}` })
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }
}

module.exports = { CategoriesService };
