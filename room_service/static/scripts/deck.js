
$.ajax('/card/').then(card_list => {
    let library_list = []
    let face_down_cards = []
    card_list.forEach(card => {
        for (i = 0; i < card.quantity; i++) {
            library_list.push({'name': card.name, 'image': card.image})
        }
    })
    
    shuffle(library_list)

    $('#library').click(() => {
        $('body').append(`
            <div id='modal'>
                <div id='modal-content'>
                    <h3>Draw face-up or face-down?</h3>
                    <input type='button' value="Face-up" class="face-up confirm">
                    <input type='button' value="Face-down" class="face-down confirm">
                    <input type='button' value="Cancel" class="cancel confirm">
                </div>
            </div>
        `)

        $('.confirm').click((e) => {
            $('#modal').remove()
            // $('#content').append()
            if ($(e.target).hasClass('face-up')) {
                $('#content').append(`
                    <img src='/Users/katherynford/workspace/Sector86/Sector86/room_service/static/${library_list[0]["image"]}' alt='${library_list[0]["image"]}' />
                `)
                library_list.shift()
            }
            else if ($(e.target).hasClass('face-down')) {
                $('#content').append(`
                    <img src='/Users/katherynford/workspace/Sector86/Sector86/room_service/static/card_images/CardBack.png' alt='Credit' />
                `)
                console.log(library_list)
                face_down_cards.push(library_list.shift())
                console.log(library_list)
                console.log(face_down_cards)
            }
        })
    })
})

function shuffle (a) {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a
    }