$.ajax('/card/').then(card_list => {
    let library_list = []
    let face_down_cards = []
    let drawn_cards = []
    let discarded_cards = []
    card_list.forEach(card => {
        for (i = 0; i < card.quantity; i++) {

            library_list.push({'name': card.name, 'image': card.image, 'card_type': card.card_type})
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
            if ($(e.target).hasClass('face-up')) {
                $('#drawn-cards-area').append(`
                    <img src='/Users/katherynford/workspace/Sector86/Sector86/room_service/static/${library_list[0]["image"]}' alt='${library_list[0]["name"]}' class="drawn card ${library_list[0]["card_type"]}" />
                `)
                drawn_cards.push(library_list.shift())
            }
            else if ($(e.target).hasClass('face-down')) {
                $('#drawn-cards-area').append(`
                    <img src='/Users/katherynford/workspace/Sector86/Sector86/room_service/static/card_images/CardBack.png' alt='Credit' class="drawn card" />
                `)

                face_down_cards.push(library_list.shift())
            }
            $('.card').not('.Mission').unbind('click').click((event) => {
                $('body').append(`
                    <div id='modal'>
                        <div id='modal-content'>
                            <h3>Discard this card?</h3>
                            <input type='button' value="Yes" class="discard-yes discard-confirm">
                            <input type='button' value="Cancel" class="cancel discard-confirm">
                        </div>
                    </div>
                `)

                $('.discard-confirm').click((confirmEvent) => {
                    if ($(confirmEvent.target).hasClass('discard-yes')) {
                        drawn_cards.forEach((card, index) => {
                            if (card.name === $(event.target).attr('alt')) {
                                discarded_cards = discarded_cards.concat(drawn_cards.splice(index, 1))
                                return
                            }
                        })
                        $(event.target).remove()
                    }
                    $('#modal').remove()
                })
            })
        })
    })

    $('#take-cards').click(() => {
        $('.drawn').not('.Mission').appendTo('#station-area')
        $('#drawn-cards-area .Mission').appendTo('#mission-area')
        while ($('#mission-area .Mission').size() > 1) {
            drawn_cards.forEach((card, index) => {
                if (card.name === $('#mission-area .Mission').first().attr('alt')) {
                    discarded_cards = discarded_cards.concat(drawn_cards.splice(index, 1))
                    return
                }
            })
            $('#mission-area .Mission').first().remove()
        }
        $('.drawn').removeClass('drawn')
        $('#mission-area .Mission').unbind('click').click((event) => {
            $('body').append(`
                <div id='modal'>
                    <div id='modal-content'>
                        <h3>Do you have the resources to complete this mission?</h3>
                        <input type='button' value="Yes" class="mission-complete-yes mission-complete-confirm">
                        <input type='button' value="Cancel" class="cancel mission-complete-confirm">
                    </div>
                </div>
            `)

            $('.mission-complete-confirm').click(confirmEvent => {
                if ($(confirmEvent.target).hasClass('mission-complete-yes')) {
                    
                    $(event.target).appendTo('#station-area')
                    $(event.target).unbind('click')
                }
                $('#modal').remove()
            })
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