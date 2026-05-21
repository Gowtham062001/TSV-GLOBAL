/**
 * Port Map Configuration & Projection Logic
 * Maps Geographic Coordinates (Lat/Lng) to CSS Percentage Positions
 */
const PORT_MAP_CONFIG = {
    // Bounds extracted from world (1).svg metadata
    bounds: {
        minLng: -169.110266,
        maxLat: 83.600842,
        maxLng: 190.486279,
        minLat: -58.508473
    },

    /**
     * Converts Lat/Lng to Percentage Coordinates
     * @param {number} lat - Latitude
     * @param {number} lng - Longitude
     * @returns {Object} { x, y } in percentages
     */
    project: function(lat, lng) {
        const totalWidth = this.bounds.maxLng - this.bounds.minLng;
        const totalHeight = this.bounds.maxLat - this.bounds.minLat;

        // Handle Lng wrapping if necessary (though our bounds cover ~360)
        let normalizedLng = lng;
        if (lng < this.bounds.minLng) normalizedLng += 360;

        const x = ((normalizedLng - this.bounds.minLng) / totalWidth) * 100;
        const y = ((this.bounds.maxLat - lat) / totalHeight) * 100;

        return {
            x: Math.min(Math.max(x, 0), 100), // Clamp to 0-100
            y: Math.min(Math.max(y, 0), 100)
        };
    },

    /**
     * Generates a random shipment count between 100 and 9999
     */
    getRandomShipments: function() {
        return Math.floor(Math.random() * 9000) + 1000;
    }
};
