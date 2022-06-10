package main

import (
	"crypto/hmac"
	"crypto/sha1"
	"encoding/base64"
	"github.com/gofrs/uuid"
	"os"
	"sort"
	"strings"
)

type SortMoldParams []MoldParams
type MoldParams map[string]string

func (s SortMoldParams) Len() int {
	return len(s)
}
func (s SortMoldParams) Less(i, j int) bool {
	for keyi := range s[i] {
		for keyj := range s[j] {
			return keyi < keyj
		}
	}
	return false
}

func (s SortMoldParams) Swap(i, j int) {
	for keyi, valuei := range s[i] {
		for keyj, valuej := range s[j] {
			s[i][keyj] = valuej
			s[j][keyi] = valuei
			delete(s[i], keyi)
			delete(s[j], keyj)
			return
		}
	}
}
func makeStringParams(params []MoldParams) string {
	var result string

	params1 := []MoldParams{
		{"apikey": os.Getenv("MoldApiKey")},
		{"response": "json"},
	}
	params = append(params, params1...)
	sort.Sort(SortMoldParams(params))

	for _, tuple := range params {
		for key, value := range tuple {
			result = result + key + "=" + value + "&"
		}
	}
	result = strings.TrimRight(result, "&")
	log.Infof("Mold 통신전 params[%v]\n", result)
	return result
}

func makeSignature(payload string) string {
	secretkey := os.Getenv("MoldSecretKey")
	strurl := strings.Replace(strings.ToLower(payload), "+", "%20", -1)
	//strurl = strings.Replace(strings.ToLower(strurl), "/", "%2F", -1)
	log.Infof("makeSignature payload [%v]\n", payload)
	secret := []byte(secretkey)
	message := []byte(strurl)
	hash := hmac.New(sha1.New, secret)
	hash.Write(message)
	strHash := base64.StdEncoding.EncodeToString(hash.Sum(nil))
	log.Infof("makeSignature payload [%v]\n", payload)
	returnString := strings.Replace(strHash, "+", "%2B", -1)
	return returnString
}

func getUuid() string {
	uuidValue, _ := uuid.NewV4()

	return uuidValue.String()
}
