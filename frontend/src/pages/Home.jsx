import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div
      className="w-full px-4 md:px-8"
      style={{ background: "#fff5f8" }}   // light blush background
    >

      {/* ================= HERO SECTION ================= */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: 400,
          borderRadius: 20,
          overflow: "hidden",
          backgroundImage:
            "url(https://img.pikbest.com/wp/202408/website-online-shopping-in-denmark-an-impressive-3d-render-for-social-media-and-websites_9737255.jpg!w700wp)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
        }}
      >
        {/* OVERLAY */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.25), rgba(0,0,0,0.65))",
          }}
        />

        {/* HERO CONTENT */}
        <div
          style={{
            position: "absolute",
            bottom: 50,
            left: 40,
            color: "#fff",
            maxWidth: 520,
          }}
        >
          <h1 style={{ margin: 0, fontSize: 42, fontWeight: 700 }}>
            ShopEase
          </h1>

          <p
            style={{
              margin: "12px 0 22px",
              fontSize: 17,
              opacity: 0.95,
              lineHeight: 1.6,
            }}
          >
            Discover beauty, fashion & lifestyle essentials curated just for you.
          </p>

          <Link to="/products">
            <button
              style={{
                padding: "12px 26px",
                background:
                  "linear-gradient(90deg, #ff3e6c, #ff7a9e)",
                border: "none",
                borderRadius: 30,
                color: "white",
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
                transition: "0.3s",
              }}
            >
              Shop Now
            </button>
          </Link>
        </div>
      </div>

      {/* ================= TRENDING CATEGORIES ================= */}
      <div
        style={{
          marginTop: 60,
          padding: "40px 20px",
          borderRadius: 24,
          background:
            "linear-gradient(180deg, #ffffff, #fff0f5)",
        }}
      >
        <h2 style={{ textAlign: "center", fontSize: 26, fontWeight: 600 }}>
          Trending Categories
        </h2>

        <p style={{ textAlign: "center", color: "#777", marginBottom: 36 }}>
          Explore the best deals made specially for you
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 24,
          }}
        >
          {["Beauty", "Fashion", "Lifestyle"].map((cat) => (
            <div
              key={cat}
              style={{
                padding: 30,
                borderRadius: 20,
                background: "#ffffff",
                boxShadow: "0 14px 30px rgba(255,62,108,0.15)",
                fontWeight: 600,
                textAlign: "center",
              }}
            >
              {cat}
            </div>
          ))}
        </div>
      </div>

      {/* ================= WHY SHOP WITH SHOPEASE ================= */}
      <div
        style={{
          marginTop: 80,
          padding: "50px 20px",
          borderRadius: 24,
          background:
            "linear-gradient(180deg, #fff0f5, #ffffff)",
        }}
      >
        <h2 style={{ textAlign: "center", fontSize: 26, fontWeight: 600 }}>
          Why Shop with ShopEase
        </h2>

        <p
          style={{
            textAlign: "center",
            color: "#777",
            marginBottom: 40,
          }}
        >
          Trusted by customers for quality, speed, and convenience
        </p>

        <div
          style={{
            display: "flex",
            gap: 20,
            overflowX: "auto",
            paddingBottom: 10,
          }}
        >
          {[
            {
              title: "Fast Delivery",
              desc: "Quick & reliable delivery",
              img: "https://cdn-icons-png.flaticon.com/512/891/891462.png",
            },
            {
              title: "100% Authentic",
              desc: "Genuine branded products",
              img: "https://cdn-icons-png.flaticon.com/512/190/190411.png",
            },
            {
              title: "Easy Returns",
              desc: "No-stress refunds",
              img: "https://cdn-icons-png.flaticon.com/512/929/929426.png",
            },
            {
              title: "Secure Payments",
              desc: "Encrypted & safe",
              img: "https://cdn-icons-png.flaticon.com/512/3064/3064197.png",
            },
          ].map((item) => (
            <div
              key={item.title}
              style={{
                minWidth: 260,
                padding: 26,
                background: "#ffffff",
                borderRadius: 20,
                boxShadow: "0 16px 32px rgba(255,62,108,0.18)",
                textAlign: "center",
              }}
            >
              <img
                src={item.img}
                alt={item.title}
                style={{ width: 46, marginBottom: 14 }}
              />

              <h3 style={{ fontSize: 16, marginBottom: 6 }}>
                {item.title}
              </h3>

              <p style={{ fontSize: 14, color: "#666" }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
