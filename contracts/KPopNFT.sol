// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract KPopNFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIds;
    uint256 private _concertIds;

    struct TicketMetadata {
        uint256 concertId;
        string seatNumber;
        uint256 date;
    }

    struct Concert {
        uint256 id;
        string name;
        string artist;
        string venue;
        string date; // Format: MM/DD/YYYY or similar string
        string imageUrl;
        uint256 ticketPrice;
        uint256 maxSupply;
        uint256 currentMinted;
        bool isActive;
    }

    mapping(uint256 => TicketMetadata) public ticketDetails;
    mapping(uint256 => Concert) public concerts;

    event TicketMinted(uint256 indexed tokenId, address indexed buyer, uint256 concertId);
    event ConcertCreated(uint256 indexed concertId, string name, uint256 price);

    constructor() ERC721("KPopNFT", "KPN") Ownable(msg.sender) {}

    function createConcert(
        string memory name,
        string memory artist,
        string memory venue,
        string memory date,
        string memory imageUrl,
        uint256 ticketPrice,
        uint256 maxSupply
    ) public onlyOwner returns (uint256) {
        _concertIds++;
        uint256 newConcertId = _concertIds;

        concerts[newConcertId] = Concert({
            id: newConcertId,
            name: name,
            artist: artist,
            venue: venue,
            date: date,
            imageUrl: imageUrl,
            ticketPrice: ticketPrice,
            maxSupply: maxSupply,
            currentMinted: 0,
            isActive: true
        });

        emit ConcertCreated(newConcertId, name, ticketPrice);
        return newConcertId;
    }

    function getAllConcerts() public view returns (Concert[] memory) {
        Concert[] memory allConcerts = new Concert[](_concertIds);
        for (uint256 i = 1; i <= _concertIds; i++) {
            allConcerts[i - 1] = concerts[i];
        }
        return allConcerts;
    }

    function getConcert(uint256 concertId) public view returns (Concert memory) {
        return concerts[concertId];
    }

    function mintTicket(
        address recipient,
        string memory tokenURI,
        uint256 concertId,
        string memory seat
    ) public payable returns (uint256) {
        require(concerts[concertId].isActive, "Concert is not active");
        require(concerts[concertId].currentMinted < concerts[concertId].maxSupply, "Sold out");
        require(msg.value >= concerts[concertId].ticketPrice, "Insufficient funds");

        _tokenIds++;
        uint256 newItemId = _tokenIds;

        _mint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI);

        ticketDetails[newItemId] = TicketMetadata({
            concertId: concertId,
            seatNumber: seat,
            date: 0 // Legacy/unused or parse date if needed
        });

        concerts[concertId].currentMinted++;

        emit TicketMinted(newItemId, recipient, concertId);

        return newItemId;
    }

    function withdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
