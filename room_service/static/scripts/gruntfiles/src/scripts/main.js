const $ = require("jquery")
const deck = require('deck')

let socket = new WebSocket('ws://localhost:8089/')

// This function is performed when the websocket connecttion is opened.
socket.onopen = function() {
    let room_num = parseInt(($('#room-id').text()), 10)
    
    socket.send(JSON.stringify({
        user: {
            id: localStorage.getItem('user_id'),
            name: localStorage.getItem('user_name')
        },
        action: 'connect',
        room: room_num
    }))
}

// This function is performed when the websocket client recieves a message from the server
socket.onmessage = function(e) {
    // e.data contains received string.
    let recievedData = JSON.parse(e.data)

    if (recievedData.action === 'card') {
        $(`#${recievedData.data.card_type === 'Mission' && recievedData.data.destination !==  'station-Mission-area'? '' : 'opponent-'}${recievedData.data.destination}`).append(`
            <img src='/Users/katherynford/workspace/Sector86/Sector86/room_service/static/${recievedData.data.card_image}' alt='${recievedData.data.card_name}' type='${recievedData.data.card_type}' class="${recievedData.data.destination === 'drawn-cards-area' || recievedData.data.destination === 'station-Credit-area' && recievedData.data.card_type !== 'Mission' ? 'drawn ' : ''}card ${recievedData.data.card_type}"  id="${recievedData.data.card_id}"/>
            ${recievedData.data.destination === 'drawn-cards-area' || recievedData.data.destination === 'station-Credit-area' ? '<br />' : '' }
        `)
    } else if (recievedData.action === 'win') {
        $('body').append(`
            <div id='win-screen'>
                <h1>${recievedData.user.name} has won. Better luck next time!</h1>
                <input type='button' value='Replay' id='replay-game'>
            </div>
        `)
        $('#replay-game').click(() => {
            location.reload()
        })
    }
        
};

// Handler to hide the hint box
$('#hide-hints').click(() => {
    $('#play-hints').hide()
})

// This function calls the card list from the database, all other functions occur after ajax call has been made
$.ajax('/card/').then(card_list => {

    $('#show-opponent-area').click(() => {
        $('#opponent-area').show()
    })
    $('#hide-opponent-area').click(() => {
        $('#opponent-area').hide()
    })
    // From the response, make the library
    card_list.forEach(card => {
        for (i = 0; i < card.quantity; i++) {
            deck.library_list.push({'name': card.name, 'image': card.image, 'card_type': card.card_type, 'contract': card.contract, 'card_id': card.id})
        }
    })
    
    shuffle(deck.library_list)

    // Add the handler to draw cards from the library
    $('#library').click(libraryClickEvent)

    // When the take cards button is clicked, add the cards to the station in the appropriate area
    $('#take-cards').click(() => {
        $('#drawn-cards-area .Facility').appendTo('#station-Facility-area')
        $('#drawn-cards-area .Crew').appendTo('#station-Crew-area')
        $('#drawn-cards-area .Ship').appendTo('#station-Ship-area')
        $('#drawn-cards-area .Levy').appendTo('#station-Levy-area')
        $('#drawn-cards-area br').remove()

        $('.drawn').removeClass('drawn')
    })
})

// Function to randomize the array that cards are stored in, or "shuffle" the deck
function shuffle (a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a
}

// This function is called every time the user clicks the library
function libraryClickEvent () {
    // Adds the modal box for user selection
    $('body').append(`
            <div id='modal'>
                <div id='modal-content'>
                    <h3>Draw cards or draw credits?</h3>
                    <input type='button' value="Cards" class="face-up confirm">
                    <input type='button' value="Credits" class="face-down confirm">
                    <input type='button' value="Cancel" class="cancel confirm">
                </div>
            </div>
        `)
        // Handler for clicking on one of the confirm options
        $('.confirm').click((e) => {
            // Remove the modal
            $('#modal').remove()
            // Check if the library is out of cards
            if (deck.library_list.length === 0) {
                // If the discard pile is empty and the library is empty, the game ends in a loss.
                if (deck.discarded_cards.length === 0) {
                    $('body').append(`
                        <div id='modal'>
                            <div id='modal-content'>
                                <h3>You ran out of cards. The economy has crashed. Game over.</h3>
                                <input type='button' value="Replay" id="game-over-replay">
                            </div>
                        </div>
                    `)
                    // Reload the page to play again
                    $('#game-over-replay').click(() => {
                        location.reload()
                    })
                }
                // Shuffle the discard pile into the library
                deck.library_list = deck.library_list.concat(deck.discarded_cards)
                deck.discarded_cards = []
                $('#discard-area .card').remove()
                shuffle(deck.library_list)
            }
            // If the user draws a card face up
            if ($(e.target).hasClass('face-up')) {
                // Add card to the drawn cards area
                $('#drawn-cards-area').append(`
                    <img src='/Users/katherynford/workspace/Sector86/Sector86/room_service/static/${deck.library_list[0]["image"]}' alt='${deck.library_list[0]["name"]}' type='${deck.library_list[0]["card_type"]}' class="drawn card ${deck.library_list[0]["card_type"]} ${deck.library_list[0]["contract"] ? ' contract' : ''}" image="${deck.library_list[0]["image"]}" id="${deck.library_list[0]["card_id"]}"/>
                    <br />
                `)
                // Send draw information to the other players
                sendMessage('card', deck.library_list[0]["name"],deck.library_list[0]["card_type"],deck.library_list[0]["card_id"], deck.library_list[0]["image"], 'library', ((deck.library_list[0]["card_type"] === 'Mission') ? 'mission-area' : 'drawn-cards-area'))
                deck.drawn_cards.push(deck.library_list.shift())
                
                // Move mission cards to the mission area automatically
                $('#drawn-cards-area .Mission').next().remove()
                $('#drawn-cards-area .Mission').removeClass('drawn')
                $('#drawn-cards-area .Mission').appendTo('#mission-area')
                // Discard cards in excess of 1
                while ($('#mission-area .Mission').length > 1) {
                    deck.drawn_cards.forEach((card, index) => {
                    if (card.name === $('#mission-area .Mission').first().attr('alt')) {
                        sendMessage('card', card.name, card.type, card.id, card.image, 'mission-area', 'discard-area')
                        deck.discarded_cards = deck.discarded_cards.concat(deck.drawn_cards.splice(index, 1))
                        return
                        }
                    })
                    $('#mission-area .Mission').first().appendTo('#discard-area')
                }
                // Click event for missions
                $('#mission-area .Mission').unbind('click').click(missionEvent)
            }
            else if ($(e.target).hasClass('face-down')) {
                $('#station-Credit-area').append(`
                    <img src='/Users/katherynford/workspace/Sector86/Sector86/room_service/static/card_images/CardBack.png' alt='Credit' class="Credit card drawn" />
                    <br />
                `)
                sendMessage('card', '' ,'Credit' , '', "/card_images/CardBack.png", 'library', 'station-Credit-area')
                deck.face_down_cards.push(deck.library_list.shift())
            }
            $('.card').not('.Mission').unbind('click').click(discardEvent)
        })
}

function discardEvent (event) {
    $('body').append(`
    <div id='modal'>
    <div id='modal-content'>
    <h3>${$(event.target).hasClass('Credit') ? "Spend this Credit?": "Discard this Card"}</h3>
    <input type='button' value="Yes" class="discard-yes discard-confirm">
    <input type='button' value="Cancel" class="cancel discard-confirm">
    </div>
    </div>
    `)
    if ($(event.target).hasClass('contract')) {
        $('#modal-content').prepend(`
            <h3>Complete this contract?</h3>
            <input type='button' value="Yes" class="contract-yes contract-confirm">
            <input type='button' value="Cancel" class="cancel contract-confirm">
        `)
        $('.contract-confirm').click((e) => {
            $('#modal').remove()
            if ($(e.target).hasClass('contract-yes')) {
                $('body').append(`
                    <div id='modal'>
                        <div id='modal-content'>
                            <h3>Draw your credits</h3>
                            <input type='button' value="Ok" id='okay'>
                        </div>
                    </div>
                `)

                $('#okay').click(() => {
                    $('#modal').remove()
                })
            }
        })
    }

    $('.discard-confirm').click((confirmEvent) => {
        if ($(confirmEvent.target).hasClass('discard-yes')) {
            deck.drawn_cards.forEach((card, index) => {
                if (card.name === $(event.target).attr('alt')) {
                    deck.discarded_cards = deck.discarded_cards.concat(deck.drawn_cards.splice(index, 1))
                    return
                }
            })
            $(event.target).not('.Credit').next('br').remove()
            $(event.target).removeClass('drawn')
            $(event.target).unbind('click')
            sendMessage('discard', $(event.target).attr('alt'), $(event.target).attr('type'),$(event.target).attr('id'), $(event.target).attr('image'), $(event.target).parent().attr('id'), 'discard-area')
            $(event.target).appendTo('#discard-area')
            
            $('#discard-area [alt="Wreck"]').unbind('click').click((restoreEvent) => {
                $('body').append(`
                    <div id='modal'>
                        <div id='modal-content'>
                            <h3>Return to the queue?</h3>
                            <input type='button' value="Yes" class="restore-yes restore-confirm">
                            <input type='button' value="Cancel" class="cancel restore-confirm">
                        </div>
                    </div>
                `)

                $('.restore-confirm').click(restoreConfirmEvent => {
                    $('#modal').remove()
                    if ($(restoreConfirmEvent.target).hasClass('restore-yes')) {
                        $(restoreEvent.target).addClass('drawn')
                        $(restoreEvent.target).appendTo('#drawn-cards-area')
                    }
                })


            })
        }
        $('#modal').remove()
    })
}

function missionEvent (event) {
    $('body').append(`
        <div id='modal'>
            <div id='modal-content'>
                <h3>Do you have the resources to complete this mission?</h3>
                <input type='button' value="Yes" class="mission-complete-yes mission-complete-confirm">
                <input type='button' value="Cancel" class="cancel mission-complete-confirm">
            </div>
        </div>
    `)
    // Add contract details if needed
    if ($(event.target).hasClass('contract')) {
        $('#modal-content').prepend(`
            <h3>Complete this contract?</h3>
            <input type='button' value="Yes" class="contract-yes contract-confirm">
            <input type='button' value="Cancel" class="cancel contract-confirm">
        `)
        $('.contract-confirm').click((e) => {
            $('#modal').remove()
            if ($(e.target).hasClass('contract-yes')) {
                $('body').append(`
                    <div id='modal'>
                        <div id='modal-content'>
                            <h3>Draw your credits</h3>
                            <input type='button' value="Ok" id='okay'>
                        </div>
                    </div>
                `)

                $('#okay').click(() => {
                    $('#modal').remove()
                })
            }
        })
    }
    // Click event for modal options
    $('.mission-complete-confirm').click(confirmEvent => {
        // If the mission is complete, add it to the completed mission area
        if ($(confirmEvent.target).hasClass('mission-complete-yes')) {
            
            $(event.target).appendTo('#station-Mission-area')
            $(event.target).unbind('click')
            sendMessage('card', $(event.target).attr('alt'), $(event.target).attr('type'), $(event.target).attr('id'), $(event.target).attr('image'), 'mission-area', 'station-Mission-area')

            if ($('#station-area .Mission').length >= 3) {
                $('body').append(`
                    <div id='win-screen'>
                        <h1>Congratulations! You won!</h1>
                        <input type='button' value='Replay' id='replay-game'>
                    </div>
                `)
                socket.send(JSON.stringify({
                    user: {
                        id: localStorage.getItem('user_id'),
                        name: localStorage.getItem('user_name')
                    },
                    action: 'win',
                    room: parseInt(($('#room-id').text()), 10)
                }))

                $('#replay-game').click(() => {
                    location.reload()
                })
            }
        }
        $('#modal').remove()
    })
}


function sendMessage (action, name, type, id, image, origin, destination) {
    let room_num = parseInt(($('#room-id').text()), 10)
    
    socket.send(JSON.stringify({
        user: {
            id: localStorage.getItem('user_id'),
            name: localStorage.getItem('user_name')
        },
        action: action,
        room: room_num,
        data: {
            "card_name": name,
            "card_type": type,
            "card_id": id,
            "card_image": image,
            "origin": origin,
            "destination": destination,
            "drawn": deck.drawn_cards,
            "face_down": deck.face_down_cards,
            "discard": deck.discarded_cards,
            "library": deck.library_list
        }
    }))
}