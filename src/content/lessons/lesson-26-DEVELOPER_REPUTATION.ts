import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 26,
  projectPath: "DEVELOPER_REPUTATION",
  explanation: `## Lesson 26 — Source Reveal Security

### What You'll Learn
Guard against: revealing source before purchase confirmation, early fund release, and seller self-purchase.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

import json
from genlayer import *


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

    @gl.public.write
    def confirm_purchase(self, listing_id: str) -> None:
        assert listing_id in self.listing_titles, "Listing not found"
        assert gl.message.sender_address == self.purchase_buyers[listing_id], "Only buyer can confirm"
        assert self.purchase_statuses[listing_id] == "pending", "Purchase must be pending"
        assert not self.seller_claimed.get(listing_id, False), "Already paid"
        self.seller_claimed[listing_id] = True
        self.purchase_statuses[listing_id] = "completed"
        self.listing_statuses[listing_id] = "sold"
        seller = self.listing_sellers[listing_id]
        seller.transfer(self.purchase_escrow[listing_id])

    @gl.public.view
    def get_source_hash(self, listing_id: str) -> str:
        assert self.purchase_statuses.get(listing_id, "") == "completed", "Purchase must be completed to access source"
        return self.listing_source_hashes[listing_id]

    listing_ai_verdicts: TreeMap[str, str]

    @gl.public.write
    def evaluate_listing_with_ai(self, listing_id: str) -> str:
        assert listing_id in self.listing_titles, "Listing not found"
        title = self.listing_titles[listing_id]
        description = self.listing_descriptions[listing_id]
        preview = self.listing_previews[listing_id]
        prompt = (
            f"Code Listing Evaluation:\\n"
            f"Title: {title}\\n"
            f"Description: {description}\\n"
            f"Preview snippet: {preview}\\n\\n"
            f"Respond with JSON: {{\\"verdict\\": \\"approve\\" or \\"reject\\", "
            f"\\"quality_score\\": 0-100, \\"explanation\\": \\"reason\\"}}"
        )
        def run(prompt):
            result = gl.nondet.exec_prompt(prompt)
            import re
            m = re.search(r'\\{.*\\}', result, re.DOTALL)
            return m.group(0) if m else result
        result = gl.eq_principle_strict_eq(run, prompt)
        self.listing_ai_verdicts[listing_id] = result
        return result

    @gl.public.view
    def get_frontend_actions_json(self) -> str:
        return json.dumps({
            "create": "create_listing(title, description, price, source_hash, preview)",
            "list": "get_active_listings_json()",
            "detail": "get_listing_json(listing_id)",
            "buy": "buy_listing(listing_id)",
            "confirm": "confirm_purchase(listing_id)",
            "source": "get_source_hash(listing_id)",
            "evaluate": "evaluate_listing_with_ai(listing_id)",
            "remove": "remove_listing(listing_id)",
        }, sort_keys=True)

    @gl.public.view
    def get_test_checklist_json(self) -> str:
        return json.dumps([
            "Create a listing with valid data",
            "Reject listing with zero price",
            "Buy a listing with correct amount",
            "Reject seller buying own listing",
            "Confirm purchase — seller gets paid",
            "Access source hash only after confirmed purchase",
            "Evaluate listing quality with AI",
            "Reject duplicate seller payment",
        ], sort_keys=True)
`,
  task: `Add a guard in \`buy_listing\`: assert the listing hasn't already been purchased (status must be "active"). Add message: "Listing is no longer available".`,
  hints: [
    "Assert listing_statuses[listing_id] == 'active' before processing payment.",
    "This prevents double-purchasing.",
    "Key line: `assert self.listing_statuses[listing_id] == 'active', 'Listing is no longer available'`",
  ],
};

export default content;
