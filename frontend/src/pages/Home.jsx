import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="w-full">

      {/* HERO SECTION */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: 360,
          borderRadius: 16,
          overflow: "hidden",
          backgroundImage:
            "url(https://img.pikbest.com/wp/202408/website-online-shopping-in-denmark-an-impressive-3d-render-for-social-media-and-websites_9737255.jpg!w700wp)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* DARK OVERLAY */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.25), rgba(0,0,0,0.60))",
          }}
        />

        {/* TEXT CONTENT */}
        <div style={{ position: "absolute", bottom: 40, left: 32, color: "white" }}>
          <h1
            style={{
              margin: 0,
              fontSize: 34,
              fontWeight: "700",
              letterSpacing: 0.6,
            }}
          >
            ShopEase
          </h1>

          <p
            style={{
              margin: "8px 0 16px",
              opacity: 0.95,
              fontSize: 16,
            }}
          >
            Beauty, Fashion & Lifestyle – curated just for you.
          </p>

          {/* SHOP NOW BUTTON → PRODUCTS PAGE */}
          <Link to="/products">
            <button
              style={{
                padding: "10px 22px",
                backgroundColor: "#ff3e6c", // Nykaa Pink
                border: "none",
                borderRadius: 25,
                color: "white",
                fontSize: 15,
                fontWeight: "600",
                cursor: "pointer",
                transition: "0.25s",
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = "#e0355e")}
              onMouseOut={(e) => (e.target.style.backgroundColor = "#ff3e6c")}
            >
              Shop Now
            </button>
          </Link>
        </div>
      </div>

      {/* EXTRA SECTION */}
      <div style={{ marginTop: 40, textAlign: "center" }}>
        <h2 style={{ fontWeight: "600", color: "#333" }}>Trending Categories</h2>
        <p style={{ color: "#666" }}>
          Explore the best deals made specially for you.
        </p>
      </div>
    </div>
  );
}
