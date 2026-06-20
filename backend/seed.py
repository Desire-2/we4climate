"""
Seed script — create a test admin user and sample opportunities.

Usage
-----
    python seed.py                   # creates admin / admin123 + sample data
    python seed.py --username test --password mypass
"""
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app import create_app, db
from app.models import Pledge, Opportunity, AdminUser, DistrictMetric, ImpactStory
from app.routes.admin import seed_admin

SAMPLE_PLEDGES = [
    {
        "name": "Iradukunda Alice",
        "district": "Kicukiro (Kigali)",
        "trees_count": 25,
        "tree_type": "Planting indigenous tree species (e.g., Markhamia)",
    },
    {
        "name": "Niyonsaba Moses",
        "district": "Musanze",
        "trees_count": 50,
        "tree_type": "Sensitizing local children and nursery cohorts",
    },
    {
        "name": "Keza Diane",
        "district": "Gasabo (Kigali)",
        "trees_count": 15,
        "tree_type": "Organizing an environmental club event",
    },
    {
        "name": "Habimana Jean-Pierre",
        "district": "Rubavu",
        "trees_count": 30,
        "tree_type": "Hosting on-ground cleanup campaigns",
    },
]

SAMPLE_OPPORTUNITIES = [
    {
        "title": "Forestry & Agroforestry Field Assistant",
        "type": "Internship",
        "location": "Musanze (Northern Province)",
        "deadline": "June 30, 2026",
        "description": "Collaborate directly with senior local foresters and support community-led tree planting coordinates. Gain on-ground expert experience in seed selection and progressive terracing alignment.",
        "requirements": [
            "Enrolled in or recently graduated with an Environment, Forestry, or Agronomy major",
            "Based in or able to relocate to Musanze District",
            "Demonstrated passion for soil and ecosystem restoration",
        ],
    },
    {
        "title": "District Environmental Club Coordinator",
        "type": "Volunteer",
        "location": "Bugesera & Kayonza",
        "deadline": "July 05, 2026",
        "description": "Empower primary and secondary school student units. Set up interactive nature tables, plant school orchards, and coordinate local environment clubs under We4Climate national metrics.",
        "requirements": [
            "Exceptional team leadership and community outreach skills",
            "Comfortable organizing and facilitating local district learning seminars",
            "Available at least 8 hours a week",
        ],
    },
    {
        "title": "Urban Wetland Advocacy Officer",
        "type": "Job",
        "location": "K Kigali (Kicukiro HQ)",
        "deadline": "July 15, 2026",
        "description": "Manage campaigns raising urban biodiversity awareness around Kigali's major valleys and restored parks (Nyandungu). Develop intergenerational dialogue programs and lead expert roundtables.",
        "requirements": [
            "Bachelor's degree in Environmental Science, PR, or Community Studies",
            "Fluent in English and Kinyarwanda; excellent draft and presentation skills",
            "Proven history of running ecological campaigns or community workshops",
        ],
    },
    {
        "title": "Nature-Based Solutions Development Leader",
        "type": "Job",
        "location": "K Kigali (Kicukiro HQ)",
        "deadline": "July 28, 2026",
        "description": "Design technical models for community soil restoration and hillside binding. Provide mentorship, advice, and consultancy for our community member units deploying district pilot trials across Rwanda.",
        "requirements": [
            "2+ years experience drafting biodiversity conservation or NBS models",
            "Deep understanding of ecological policy targets (CBD, Paris Agreement)",
            "Passionate trainer with a desire to foster systemic intergenerational equity",
        ],
    },
    {
        "title": "UNEP Green Jobs Youth Programme (External)",
        "type": "Internship",
        "location": "Nairobi, Kenya (Remote OK)",
        "deadline": "August 15, 2026",
        "description": "The United Nations Environment Programme (UNEP) is seeking passionate youth leaders for its green jobs initiative. Work on policy research, community engagement, and climate adaptation projects across Africa.",
        "requirements": [
            "Background in environmental science, policy, or related field",
            "Aged 18-35 at time of application",
            "Strong research and written communication skills",
        ],
        "is_external": True,
        "external_url": "https://unep.org/green-jobs-youth-2026",
    },
]


def seed_opportunities():
    """Create sample opportunities if none exist."""
    existing = Opportunity.query.first()
    if existing:
        print("Opportunities already seeded — skipping.")
        return

    for data in SAMPLE_OPPORTUNITIES:
        opp = Opportunity(
            title=data["title"],
            type=data["type"],
            location=data["location"],
            deadline=data["deadline"],
            description=data["description"],
            requirements=data["requirements"],
            is_active=True,
        )
        db.session.add(opp)
    db.session.commit()
    print(f"Seeded {len(SAMPLE_OPPORTUNITIES)} sample opportunities.")


# -----------------------------------------------------------------------
# Sample Districts (maps to the 6 fallback districts in the frontend)
# -----------------------------------------------------------------------
SAMPLE_DISTRICTS = [
    {
        "district_name": "Bugesera",
        "province": "Eastern Province",
        "province_key": "east",
        "description": "Combating persistent aridity and desertification trends through multi-layered agroforestry buffer strips on smallholder farms.",
        "species": ["Grevillea robusta", "Senna spectabilis", "Avocado", "Mango"],
        "map_coords_x": 62.0,
        "map_coords_y": 66.0,
        "trees_planted": 35000,
        "community_members": 1100,
        "farmers_trained": 320,
        "active_sites": 3,
    },
    {
        "district_name": "Gicumbi",
        "province": "Northern Province",
        "province_key": "north",
        "description": "Stabilizing steep mountainous hillsides prone to erosive landslides and establishing riparian protection buffers.",
        "species": ["Calliandra calothyrsus", "Alnus nepalensis", "Indigenous Podocarpus"],
        "map_coords_x": 52.0,
        "map_coords_y": 22.0,
        "trees_planted": 42000,
        "community_members": 950,
        "farmers_trained": 410,
        "active_sites": 4,
    },
    {
        "district_name": "Kayonza",
        "province": "Eastern Province",
        "province_key": "east",
        "description": "Conserving savannah soils and pioneering organic biochar applications in community woodlots.",
        "species": ["Acacia polyacantha", "Markhamia lutea", "Papaya"],
        "map_coords_x": 75.0,
        "map_coords_y": 40.0,
        "trees_planted": 28000,
        "community_members": 850,
        "farmers_trained": 240,
        "active_sites": 2,
    },
    {
        "district_name": "Rubavu",
        "province": "Western Province",
        "province_key": "west",
        "description": "Restoring volcanic soil health and preventing riverbank degradation along local waterways flowing to Lake Kivu.",
        "species": ["Erythrina abyssinica", "Maesopsis eminii", "Bamboo buffers"],
        "map_coords_x": 18.0,
        "map_coords_y": 21.0,
        "trees_planted": 22000,
        "community_members": 900,
        "farmers_trained": 180,
        "active_sites": 2,
    },
    {
        "district_name": "Kamonyi",
        "province": "Southern Province",
        "province_key": "south",
        "description": "Flagship learning initiatives centered around the Leonard Regeneration Center incubator property.",
        "species": ["Grevillea", "Moringa oleifera", "Markhamia"],
        "map_coords_x": 42.0,
        "map_coords_y": 52.0,
        "trees_planted": 15000,
        "community_members": 1000,
        "farmers_trained": 150,
        "active_sites": 2,
    },
    {
        "district_name": "Huye",
        "province": "Southern Province",
        "province_key": "south",
        "description": "Collaborating with local schools on green camp designs and delivering hands-on permaculture masterclasses.",
        "species": ["Calliandra", "Ficus thonningii", "Citrus variety tree"],
        "map_coords_x": 36.0,
        "map_coords_y": 80.0,
        "trees_planted": 18000,
        "community_members": 800,
        "farmers_trained": 190,
        "active_sites": 2,
    },
]


SAMPLE_STORIES = [
    {
        "name": "Anathole Murekezi",
        "title": "Smallholder Shareholder • Kayonza District",
        "quote": "Being selected for the agroforestry multiplier training model saved my banana crops from the harsh summer. By intercropping nitrogen-fixing shrubs, my soil moisture improved drastically, giving extra safety margin for my family\'s nourishment.",
        "initials": "AM",
        "district_name": "Kayonza District",
        "is_active": True,
        "sort_order": 0,
    },
    {
        "name": "Diane Umutoni",
        "title": "Nexus Cohort Alumna • Kigali-wide advocacy",
        "quote": "The intensive cohort bootcamp at We4Climate equips community environmental advocates like myself with hands-on tools. I successfully started an organic waste charcoal briquette company, directly employing 6 local community members and protecting forests from charcoal cutters.",
        "initials": "DU",
        "district_name": "Kigali",
        "is_active": True,
        "sort_order": 1,
    },
    {
        "name": "Marie Mukandekezi",
        "title": "Agroforestry Trainee • Bugesera District",
        "quote": "Through the We4Climate district program, I transformed my degraded plot into a productive agroforestry farm. The training in soil conservation and tree nursery management gave me both food security and a new source of income from selling seedlings.",
        "initials": "MM",
        "district_name": "Bugesera District",
        "is_active": True,
        "sort_order": 2,
    },
]


def seed_districts():
    """Create or update sample district metrics."""
    existing_names = {r.district_name for r in DistrictMetric.query.all()}
    target_names = {d["district_name"] for d in SAMPLE_DISTRICTS}

    # Only add districts that don't already exist
    added = 0
    for data in SAMPLE_DISTRICTS:
        if data["district_name"] not in existing_names:
            metric = DistrictMetric(**data)
            db.session.add(metric)
            added += 1

    # Update old pledge-generated districts with proper defaults
    updated = 0
    for r in DistrictMetric.query.all():
        if r.province_key == "east" and r.map_coords_x is None:
            r.province = "Kigali City"
            r.province_key = "kigali"
            r.description = "Community hub district supporting tree-planting and environmental awareness campaigns."
            r.species = ["Grevillea", "Markhamia lutea", "Avocado"]
            r.map_coords_x = 50.0
            r.map_coords_y = 50.0
            updated += 1

    if added:
        db.session.commit()
        print(f"Added {added} new districts.")
    if updated:
        db.session.commit()
        print(f"Updated {updated} old districts with default enhanced fields.")
    if not added and not updated:
        print("Districts already seeded — skipping.")


def seed_stories():
    """Create sample impact stories if none exist."""
    existing = ImpactStory.query.first()
    if existing:
        print("Stories already seeded — skipping.")
        return

    for data in SAMPLE_STORIES:
        story = ImpactStory(**data)
        db.session.add(story)
    db.session.commit()
    print(f"Seeded {len(SAMPLE_STORIES)} sample impact stories.")


def seed_pledges():
    """Create sample pledges if none exist."""
    existing = Pledge.query.first()
    if existing:
        print("Pledges already seeded — skipping.")
        return

    for data in SAMPLE_PLEDGES:
        pledge = Pledge(
            name=data["name"],
            district=data["district"],
            trees_count=data["trees_count"],
            tree_type=data["tree_type"],
        )
        # Also update district metrics
        metric = DistrictMetric.query.filter_by(district_name=data["district"]).first()
        if metric:
            metric.trees_planted += data["trees_count"]
            metric.community_members += 1
        else:
            metric = DistrictMetric(
                district_name=data["district"],
                trees_planted=data["trees_count"],
                community_members=1,
                farmers_trained=0,
                active_sites=1,
            )
            db.session.add(metric)
        db.session.add(pledge)
    db.session.commit()
    print(f"Seeded {len(SAMPLE_PLEDGES)} sample pledges.")


if __name__ == "__main__":
    username = "admin"
    password = "admin123"

    args = iter(sys.argv[1:])
    for arg in args:
        if arg in ("--username", "-u"):
            username = next(args, username)
        elif arg in ("--password", "-p"):
            password = next(args, password)

    app = create_app()
    with app.app_context():
        db.create_all()
        seed_admin(username=username, password=password)
        seed_districts()
        seed_stories()
        seed_opportunities()
        seed_pledges()
        print(f"\n✅  Admin login:  username: {username}  /  password: {password}")
        print(f"✅  {len(SAMPLE_DISTRICTS)} sample districts seeded")
        print(f"✅  {len(SAMPLE_STORIES)} sample impact stories seeded")
        print(f"✅  {len(SAMPLE_OPPORTUNITIES)} sample opportunities seeded")
        print(f"✅  {len(SAMPLE_PLEDGES)} sample pledges seeded")
        print()
