package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
)

var avatarUrls = []string{
	"https://api.dicebear.com/7.x/avataaars/svg?seed=mentorA",
	"https://api.dicebear.com/7.x/avataaars/svg?seed=mentorB",
	"https://api.dicebear.com/7.x/avataaars/svg?seed=freelancerA",
	"https://api.dicebear.com/7.x/avataaars/svg?seed=freelancerB",
	"https://api.dicebear.com/7.x/avataaars/svg?seed=studentA",
	"https://api.dicebear.com/7.x/avataaars/svg?seed=studentB",
	"https://api.dicebear.com/7.x/avataaars/svg?seed=academicA",
	"https://api.dicebear.com/7.x/avataaars/svg?seed=academicB",

	"https://api.dicebear.com/7.x/open-peeps/svg?seed=mentor1",
	"https://api.dicebear.com/7.x/open-peeps/svg?seed=mentor2",
	"https://api.dicebear.com/7.x/open-peeps/svg?seed=freelancer1",
	"https://api.dicebear.com/7.x/open-peeps/svg?seed=freelancer2",
	"https://api.dicebear.com/7.x/open-peeps/svg?seed=student1",
	"https://api.dicebear.com/7.x/open-peeps/svg?seed=student2",
	"https://api.dicebear.com/7.x/open-peeps/svg?seed=academic1",
	"https://api.dicebear.com/7.x/open-peeps/svg?seed=academic2",
}

func main() {
	location := filepath.Join("public", "avatars")
	if err := os.MkdirAll(location, 0755); err != nil {
		log.Fatal("unable to create avatar dir: " + err.Error())
	}

	for i, url := range avatarUrls {
		resp, err := http.Get(url)
		if err != nil {
			fmt.Println("Skipping url:", url, "error:", err)
			continue
		}
		if resp.StatusCode != http.StatusOK {
			fmt.Printf("Bad status code %s for url %s\n", resp.Status, url)
			resp.Body.Close()
			continue
		}

		fileName := fmt.Sprintf("avatar-%d.svg", i+1)
		dest := filepath.Join(location, fileName)

		outfile, err := os.Create(dest)
		if err != nil {
			fmt.Println("Failed to create file:", dest)
			resp.Body.Close()
			continue
		}

		_, err = io.Copy(outfile, resp.Body)
		resp.Body.Close()
		outfile.Close()

		if err != nil {
			fmt.Println("Error saving file:", err)
			continue
		}

		fmt.Println("Saved:", dest)
	}
}
