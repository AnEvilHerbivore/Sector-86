let DJANGO_STATIC_URL = '{{ STATIC_URL }}'


$.ajax('/card/').then(card_list => {
    let unsorted_library = []
    card_list.forEach(card => {
        for (i = 0; i < card.quantity; i++) {
            unsorted_library.push({'name': card.name, 'image': card.image})
        }
    })
    
    shuffle(unsorted_library)
})

function shuffle (a) {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a
    }