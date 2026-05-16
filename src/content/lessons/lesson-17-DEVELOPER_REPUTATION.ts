import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 17,
  projectPath: "DEVELOPER_REPUTATION",
  explanation: `## Lesson 17 — Buyer and Seller Rules

### What You'll Learn
Enforce role-based access: only the buyer can confirm, and sellers cannot buy their own listings.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

import json
from genlayer import *


@gl.evm.contract_interface
class _Recipient:
    class View:
        pass

    class Write:
        pass


class CodeVault(gl.Contract):
    owner: Address
    platform_name: str
    platform_description: str

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.platform_name = "CodeVault"
        self.platform_description = "A GenLayer private code marketplace."

    @gl.public.view
    def get_platform_name(self) -> str:
        return self.platform_name

    @gl.public.view
    def get_platform_description(self) -> str:
        return self.platform_description

    @gl.public.view
    def get_owner(self) -> str:
        return self.owner.as_hex

    @gl.public.view
    def get_contract_summary(self) -> str:
        return self.platform_name + ": " + self.platform_description

    @gl.public.write
    def update_platform_description(self, new_description: str) -> None:
        assert gl.message.sender_address == self.owner, "Only owner can update"
        assert len(new_description) > 0, "Description cannot be empty"
        self.platform_description = new_description

    listing_count: u256
    listing_titles: TreeMap[str, str]
    listing_descriptions: TreeMap[str, str]
    listing_sellers: TreeMap[str, Address]
    listing_prices: TreeMap[str, u256]
    listing_statuses: TreeMap[str, str]
    listing_source_hashes: TreeMap[str, str]
    listing_previews: TreeMap[str, str]

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.platform_name = "CodeVault"
        self.platform_description = "A GenLayer private code marketplace."
        self.listing_count = u256(0)

    @gl.public.write
    def create_listing(self, title: str, description: str, price: u256, source_hash: str, preview: str) -> str:
        assert len(title) > 0, "Title cannot be empty"
        assert len(description) > 0, "Description cannot be empty"
        assert price > u256(0), "Price must be greater than zero"
        assert len(source_hash) > 0, "Source hash cannot be empty"
        listing_id = str(self.listing_count)
        self.listing_titles[listing_id] = title
        self.listing_descriptions[listing_id] = description
        self.listing_sellers[listing_id] = gl.message.sender_address
        self.listing_prices[listing_id] = price
        self.listing_statuses[listing_id] = "active"
        self.listing_source_hashes[listing_id] = source_hash
        self.listing_previews[listing_id] = preview
        self.listing_count = self.listing_count + u256(1)
        return listing_id

    listing_ids: DynArray[str]

    @gl.public.view
    def get_listing_json(self, listing_id: str) -> str:
        assert listing_id in self.listing_titles, "Listing not found"
        return json.dumps({
            "id": listing_id,
            "title": self.listing_titles[listing_id],
            "description": self.listing_descriptions[listing_id],
            "seller": self.listing_sellers[listing_id].as_hex,
            "price": str(self.listing_prices[listing_id]),
            "status": self.listing_statuses[listing_id],
            "preview": self.listing_previews[listing_id],
        }, sort_keys=True)

    @gl.public.view
    def get_active_listings_json(self) -> str:
        result = []
        for lid in self.listing_ids:
            if self.listing_statuses[lid] == "active":
                result.append({"id": lid, "title": self.listing_titles[lid], "price": str(self.listing_prices[lid])})
        return json.dumps(result, sort_keys=True)

    @gl.public.view
    def get_all_listings_json(self) -> str:
        result = []
        for lid in self.listing_ids:
            result.append({"id": lid, "title": self.listing_titles[lid], "status": self.listing_statuses[lid]})
        return json.dumps(result, sort_keys=True)

    @gl.public.write
    def remove_listing(self, listing_id: str) -> None:
        assert listing_id in self.listing_titles, "Listing not found"
        assert gl.message.sender_address == self.listing_sellers[listing_id] or gl.message.sender_address == self.owner, "Not authorized"
        assert self.listing_statuses[listing_id] == "active", "Only active listings can be removed"
        self.listing_statuses[listing_id] = "removed"

    purchase_buyers: TreeMap[str, Address]
    purchase_escrow: TreeMap[str, u256]
    purchase_statuses: TreeMap[str, str]
    seller_claimed: TreeMap[str, bool]

    @gl.public.write.payable
    def buy_listing(self, listing_id: str) -> None:
        assert listing_id in self.listing_titles, "Listing not found"
        assert self.listing_statuses[listing_id] == "active", "Listing must be active"
        seller = self.listing_sellers[listing_id]
        assert gl.message.sender_address != seller, "Seller cannot buy own listing"
        assert gl.message.value >= self.listing_prices[listing_id], "Insufficient payment"
        self.purchase_buyers[listing_id] = gl.message.sender_address
        self.purchase_escrow[listing_id] = gl.message.value
        self.purchase_statuses[listing_id] = "pending"
        self.listing_statuses[listing_id] = "pending"


`,
  task: `Add \`confirm_purchase(self, listing_id: str)\` that only the original buyer can call, marks seller as claimed, pays the seller, and sets statuses to completed/sold.`,
  hints: [
    "Assert sender == purchase_buyers[listing_id].",
    "Check seller_claimed[listing_id] is False before paying.",
    "Key line: `_Recipient(seller).emit_transfer(value=self.purchase_escrow[listing_id])`",
  ],
};

export default content;
