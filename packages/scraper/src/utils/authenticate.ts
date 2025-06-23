import { client } from "./axios";

export async function authenticate(username: string, password: string) {
  try {
    const formData = new URLSearchParams();
    formData.append("UserName", username);
    formData.append("Password", password);

    const response = await client.post(
      "/student/Account/Login",
      formData.toString(),
      {
        maxRedirects: 0, // Don't follow redirects automatically
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    // Parse cookies manually from Set-Cookie headers
    const setCookieHeaders = response.headers["set-cookie"];
    let allCookies: string[] = [];

    if (setCookieHeaders) {
      allCookies = setCookieHeaders
        .map((cookieHeader) => {
          if (!cookieHeader) return null;
          // Extract just the name=value part before the first semicolon
          const cookiePart = cookieHeader.split(";")[0];
          return cookiePart;
        })
        .filter((cookie): cookie is string => cookie !== null);
    }
    // If there's a redirect, use the cookies from first response when following it
    if (response.status === 302 && response.headers.location) {
      console.log("Following redirect to:", response.headers.location);

      // Create cookie string from first response cookies
      const cookieString = allCookies.join("; ");

      const redirectResponse = await client.get(response.headers.location, {
        maxRedirects: 0,
        headers: {
          Cookie: cookieString, // Include cookies from first response
        },
      });

      console.log("Redirect response status:", redirectResponse.status);

      if (redirectResponse.headers["set-cookie"]) {
        const redirectCookies = redirectResponse.headers["set-cookie"]
          .map((cookieHeader) => {
            if (!cookieHeader) return null;
            return cookieHeader.split(";")[0];
          })
          .filter((cookie): cookie is string => cookie !== null);

        allCookies = [...allCookies, ...redirectCookies];
        console.log("Additional cookies from redirect:", redirectCookies);
      }
    }

    console.log("Total cookies found:", allCookies.length);

    // Remove duplicate cookies (keep the last occurrence of each cookie name)
    const uniqueCookies = [];
    const cookieNames = new Set();

    // Process cookies in reverse to keep the last occurrence
    for (let i = allCookies.length - 1; i >= 0; i--) {
      const cookie = allCookies[i];
      if (cookie) {
        const cookieName = cookie.split("=")[0];

        if (!cookieNames.has(cookieName)) {
          cookieNames.add(cookieName);
          uniqueCookies.unshift(cookie); // Add to beginning to maintain order
        } else {
          console.log("Removing duplicate cookie:", cookie);
        }
      }
    }

    console.log("Unique cookies:", uniqueCookies.length);

    // Manually add cookies to the jar for subsequent requests
    const jar = client.defaults.jar;
    if (jar && uniqueCookies.length > 0) {
      for (const cookie of uniqueCookies) {
        try {
          jar.setCookieSync(cookie, "https://collss.acadiau.ca");
          console.log("Successfully set cookie:", cookie);
        } catch (error) {
          console.warn("Failed to set cookie:", cookie, error);
        }
      }
      console.log("Cookies added to jar for subsequent requests");

      // Verify cookies are in jar
      const jarCookies = jar.getCookiesSync("https://collss.acadiau.ca");
      console.log("Cookies now in jar:", jarCookies.length);
    }

    return {
      success: true,
      status: response.status,
      cookies: allCookies,
      data: response.data,
    };
  } catch (error) {
    console.error("Login failed:", error);
    return {
      success: false,
      error: error,
    };
  }
}
// Test the authentication

if (authResult.success && authResult.cookies) {
  // Create cookie header string manually
  const cookieHeader = authResult.cookies.join("; ");
  console.log("Manual cookie header:", cookieHeader);

  const response = await client.post(
    "/student/Student/Courses/PostSearchCriteria",
    {},
    {
      headers: {
        Cookie: cookieHeader,
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Referer: "https://collss.acadiau.ca/student",
      },
    },
  );

  console.log("Response:", response.data);
} else {
  console.log("Authentication failed");
}
