const $ = require("jquery")




const deckManager = Object.create(null, {
    library_list: {
        value: [],
        writable: true,
    },
    face_down_cards: {
        value: [],
        writable: true
    },
    drawn_cards: {
        value: [],
        writable: true
    },
    discarded_cards: {
        value: [],
        writable: true
    }
})

module.exports = deckManager