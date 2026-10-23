// Public visual traits only. Expressions are presentation, never game state.
export type CharacterExpression = "neutral" | "alert" | "worried";
export type CharacterPose = "relaxed" | "presenting" | "detained";

type Look = {
  skin: string;
  shade: string;
  hair: string;
  coat: string;
  trim: string;
  shirt: string;
  face: string;
};
const oval =
  "M94 64Q94 38 120 37Q147 38 147 65L143 98Q136 118 119 121Q101 115 96 97Z";
const angular =
  "M92 62Q93 37 120 37Q146 38 149 63L144 100L132 119L113 122L97 107Z";
const broad =
  "M89 64Q89 38 120 37Q151 38 152 65L148 103Q138 124 119 125Q99 122 92 103Z";
const looks: Record<string, Look> = {
  restorer: {
    skin: "#dcae8b",
    shade: "#b97e63",
    hair: "#403431",
    coat: "#7c9784",
    trim: "#c8b891",
    shirt: "#eee1c4",
    face: oval,
  },
  guard: {
    skin: "#b97f5d",
    shade: "#8f583f",
    hair: "#292f30",
    coat: "#435e70",
    trim: "#c8b17a",
    shirt: "#a7bdc0",
    face: broad,
  },
  reporter: {
    skin: "#b97756",
    shade: "#965138",
    hair: "#2b292c",
    coat: "#ac614f",
    trim: "#e1bd80",
    shirt: "#efe0bf",
    face: angular,
  },
  collector: {
    skin: "#dfb79a",
    shade: "#bb8a72",
    hair: "#b9b5a7",
    coat: "#67556f",
    trim: "#d5b77e",
    shirt: "#ebdfc7",
    face: "M93 62Q94 38 121 38Q149 40 146 66L140 101L131 120L114 124L100 111Z",
  },
  conductor: {
    skin: "#a97050",
    shade: "#834a34",
    hair: "#383137",
    coat: "#385e60",
    trim: "#d2b575",
    shirt: "#d4ddd0",
    face: oval,
  },
  mechanic: {
    skin: "#ce9b77",
    shade: "#a77052",
    hair: "#583e2c",
    coat: "#9d7948",
    trim: "#d7bc88",
    shirt: "#4e6263",
    face: broad,
  },
  photographer: {
    skin: "#ebc3a0",
    shade: "#c59174",
    hair: "#b76c40",
    coat: "#6d6387",
    trim: "#c6a97c",
    shirt: "#d9ceae",
    face: "M95 60Q97 37 121 37Q148 37 147 64L143 100Q134 117 120 118Q103 113 98 97Z",
  },
  chef: {
    skin: "#9a6248",
    shade: "#704331",
    hair: "#292b29",
    coat: "#d8d3bc",
    trim: "#aa8a54",
    shirt: "#65847c",
    face: broad,
  },
  traveler: {
    skin: "#d2a17e",
    shade: "#ac7356",
    hair: "#3a3537",
    coat: "#53657c",
    trim: "#b49b73",
    shirt: "#e3d9c2",
    face: angular,
  },
  investigator: {
    skin: "#bb8a66",
    shade: "#925d43",
    hair: "#403a31",
    coat: "#9b8e70",
    trim: "#d2bf91",
    shirt: "#e3d7b9",
    face: angular,
  },
  agent: {
    skin: "#ca9b78",
    shade: "#a76e50",
    hair: "#393b38",
    coat: "#426177",
    trim: "#d5bb7b",
    shirt: "#abc0bd",
    face: angular,
  },
  unknown: {
    skin: "#c6ad8d",
    shade: "#9b846b",
    hair: "#4b5048",
    coat: "#738178",
    trim: "#c1b99d",
    shirt: "#d1c7ac",
    face: oval,
  },
};

export function CharacterFigure({
  kind,
  fullBody,
  expression = "neutral",
  pose = "relaxed",
}: {
  kind: string;
  fullBody: boolean;
  expression?: CharacterExpression;
  pose?: CharacterPose;
}) {
  const look = looks[kind] ?? looks.unknown;
  const uniform = kind === "guard" || kind === "agent" || kind === "conductor";
  const longHair =
    kind === "restorer" || kind === "reporter" || kind === "conductor";
  const suit =
    kind === "collector" || kind === "traveler" || kind === "investigator";
  const detained = pose === "detained";
  const worried = expression === "worried";
  const alert = expression === "alert";
  return (
    <svg
      className="character-figure"
      viewBox={fullBody ? "0 0 240 360" : "35 0 170 222"}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <g
        stroke="#25312e"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {fullBody && (
          <>
            <ellipse
              cx="123"
              cy="349"
              rx="54"
              ry="7"
              fill="#091a18"
              opacity=".28"
              stroke="none"
            />
            <path
              d="M88 226L86 285L80 336H108L120 267L131 336H159L155 283L150 226Z"
              fill={kind === "mechanic" ? "#485b5b" : "#35474b"}
            />
            <path
              d="M120 239V267M94 259L91 309M145 257L148 312"
              stroke="#82918a"
              opacity=".4"
            />
            <path
              d="M80 330L106 332L109 347H67Q67 338 80 330ZM132 333L158 330L172 344V348H131Z"
              fill="#253431"
            />
            <path
              d="M70 348H109M133 348H170"
              stroke="#a5aa91"
              strokeWidth="2"
            />
          </>
        )}
        {longHair && (
          <path
            d={
              kind === "restorer"
                ? "M89 88Q72 38 98 26Q140 11 154 49L160 141L133 151L86 134Z"
                : kind === "conductor"
                  ? "M88 58Q86 24 122 25Q158 25 154 68L159 142L138 149L94 135Z"
                  : "M83 73Q74 34 105 25Q144 14 157 53L163 139L136 148L83 134Z"
            }
            fill={look.hair}
          />
        )}
        {kind === "restorer" && (
          <>
            <circle cx="154" cy="47" r="20" fill={look.hair} />
            <path
              d="M146 35Q161 33 166 48M145 51Q155 59 166 51"
              stroke="#756052"
              strokeWidth="2"
            />
          </>
        )}
        {kind === "photographer" && (
          <path
            d="M86 97Q71 73 83 44Q91 19 121 23Q160 23 158 69L151 120L132 130L88 116Z"
            fill={look.hair}
          />
        )}
        <path d="M103 110L102 137L120 153L139 134L136 109Z" fill={look.skin} />
        <path
          d="M103 113L103 129Q121 140 137 122V112Z"
          fill={look.shade}
          stroke="none"
        />
        <path
          d="M102 128L80 134Q67 139 64 160L72 228Q120 244 162 229L177 161Q174 141 155 134L138 128L120 145Z"
          fill={look.coat}
        />
        <path
          d="M145 139L160 148L157 224L137 233L133 153Z"
          fill="#10292b"
          opacity=".18"
          stroke="none"
        />
        <path d="M103 131L119 145L138 130L130 192H111Z" fill={look.shirt} />
        {suit ? (
          <>
            <path
              d="M98 130L111 152L105 171L120 219L89 177L98 164L88 151ZM140 131L129 153L136 172L122 218L155 177L144 162L153 149Z"
              fill={look.coat}
            />
            <path
              d="M118 146L112 155L120 185L128 155L122 146Z"
              fill={kind === "traveler" ? "#9d5751" : "#977954"}
            />
            <path d="M143 183H156M144 191L153 185L155 193Z" fill={look.trim} />
            <circle cx="122" cy="219" r="2" fill={look.trim} />
          </>
        ) : uniform ? (
          <>
            <path d="M100 130L106 154L119 145L132 154L140 131M120 146V231" />
            <path
              d="M117 148L114 156L120 181L126 156L123 148Z"
              fill="#273f46"
            />
            <path
              d="M78 140L91 137L95 145L81 149ZM147 139L160 143L156 150L144 146Z"
              fill={look.trim}
            />
            <path
              d="M90 174H106V191H90ZM141 170L152 174L150 185L145 190L138 184L137 175Z"
              fill={look.trim}
            />
            <path d="M91 178H104M120 210H151" strokeWidth="1.4" />
            <path
              d="M74 219Q121 228 164 219V230Q116 239 74 230Z"
              fill="#2c3c3b"
            />
            <rect
              x="112"
              y="222"
              width="17"
              height="10"
              rx="2"
              stroke={look.trim}
            />
          </>
        ) : kind === "restorer" ? (
          <>
            <path
              d="M102 132L98 158L92 233Q119 241 149 233L141 157L137 132M99 160H140"
              fill={look.shirt}
            />
            <path d="M106 181H134V207H106Z" fill="#c8bd9c" />
            <path
              d="M112 183L115 164M124 184L130 162"
              stroke="#566d6b"
              strokeWidth="3"
            />
            <path
              d="M114 167L115 158M129 165L133 157"
              stroke="#a77450"
              strokeWidth="4"
            />
            <path
              d="M103 139L100 156M137 139L141 156"
              stroke={look.trim}
              strokeWidth="4"
            />
          </>
        ) : kind === "reporter" ? (
          <>
            <path
              d="M100 131L107 159L120 145L135 161L141 132"
              fill={look.shirt}
            />
            <path
              d="M100 144Q121 162 141 141L135 169L112 162Z"
              fill={look.trim}
            />
            <path d="M150 141L93 233" stroke="#493c33" strokeWidth="6" />
            <path d="M92 200L117 202L114 236L87 231Z" fill="#e1ceb0" />
            <path
              d="M96 210L111 212M95 217L108 219"
              stroke="#8c7960"
              strokeWidth="1.5"
            />
          </>
        ) : kind === "photographer" ? (
          <>
            <path d="M100 133L107 156L120 145L132 158L140 132M94 170H107M144 169H155" />
            <path
              d="M96 140L109 183M144 139L130 183"
              stroke="#413c3a"
              strokeWidth="5"
            />
            <rect
              x="100"
              y="181"
              width="43"
              height="29"
              rx="5"
              fill="#333f42"
            />
            <path d="M106 181L110 174H123L128 181" fill="#424d4f" />
            <circle cx="123" cy="195" r="11" fill="#879b9b" />
            <circle cx="123" cy="195" r="6" fill="#2b434a" />
            <path d="M120 191L125 188" stroke="#d4e0d1" strokeWidth="2" />
            <rect
              x="105"
              y="186"
              width="5"
              height="4"
              rx="1"
              fill={look.trim}
              stroke="none"
            />
          </>
        ) : kind === "chef" ? (
          <>
            <path d="M103 130L130 151V234M138 132L117 151" />
            <path
              d="M104 130L115 145L128 138L122 156L109 151Z"
              fill={look.shirt}
            />
            {[166, 186, 206].map((y) => (
              <g key={y}>
                <circle cx="108" cy={y} r="2.8" fill="#3e5351" />
                <circle cx="143" cy={y} r="2.8" fill="#3e5351" />
              </g>
            ))}
            <path d="M143 146H154L151 172" stroke={look.trim} strokeWidth="3" />
          </>
        ) : kind === "mechanic" ? (
          <>
            <path d="M99 132L104 157L119 145L135 157L142 132M120 148V233" />
            <path d="M132 173H155V197H132Z" fill="#b3925d" />
            <path d="M136 178H151" />
            <path
              d="M92 180L99 156M96 162L101 150M105 164L109 153"
              stroke="#b7c1b1"
              strokeWidth="4"
            />
            <path d="M80 220H106M133 220H158" stroke={look.trim} />
          </>
        ) : (
          <path d="M102 132L120 150L139 132M120 151V235" />
        )}
        {/* Hands and sleeves share the same coordinate space as the body. */}
        {detained ? (
          <>
            <path
              d="M78 146Q63 155 68 191L99 211L108 195L88 178L90 150M161 146Q177 158 170 191L143 211L132 195L151 177L149 150"
              fill={look.coat}
            />
            <path
              d="M100 195Q112 190 121 201L127 206L120 217Q110 218 101 210ZM139 196Q128 191 119 202L113 208L121 217Q133 218 143 209Z"
              fill={look.skin}
            />
            <path
              d="M106 203L116 209M131 203L124 211"
              stroke={look.shade}
              strokeWidth="1.5"
            />
            <g className="character-cuffs" stroke="#bfcac5" strokeWidth="3.4">
              <ellipse
                cx="104"
                cy="205"
                rx="6"
                ry="9"
                transform="rotate(-25 104 205)"
              />
              <ellipse
                cx="141"
                cy="205"
                rx="6"
                ry="9"
                transform="rotate(25 141 205)"
              />
              <path d="M110 207Q122 213 135 207" />
            </g>
          </>
        ) : pose === "presenting" ? (
          <>
            <path
              d="M78 145Q62 154 67 180L73 217L87 216L87 174L92 153M159 144Q172 151 169 174L187 168L193 184L160 195Q150 191 149 180L147 151"
              fill={look.coat}
            />
            <path
              d="M74 215L86 215L89 230Q84 240 76 233ZM186 169Q194 161 199 166L209 170L208 181L194 184Z"
              fill={look.skin}
            />
          </>
        ) : (
          <>
            <path
              d="M79 144Q64 150 65 175L72 217L86 216L87 177L92 151M157 144Q175 150 175 172L165 211L151 207L155 174L148 152"
              fill={look.coat}
            />
            <path
              d="M73 216L85 215L89 229Q86 238 78 235L72 228ZM152 205L165 209L163 223Q155 231 150 223Z"
              fill={look.skin}
            />
            <path
              d="M79 224L80 231M156 215L155 222"
              stroke={look.shade}
              strokeWidth="1.4"
            />
            <path
              d="M72 210L86 208M152 201L167 205"
              stroke={look.trim}
              strokeWidth="3"
            />
          </>
        )}
        <g className="character-head">
          {!longHair && kind !== "photographer" && (
            <path
              d="M90 67Q80 31 111 25Q147 16 153 49L151 83L91 83Z"
              fill={look.hair}
            />
          )}
          <path
            d="M95 77Q81 70 86 88Q88 98 98 94M145 77Q157 70 155 87Q152 98 143 94"
            fill={look.skin}
          />
          <path d={look.face} fill={look.skin} />
          <path
            d="M138 54Q151 69 141 99L131 115L116 120L131 121Q144 110 147 96L149 65L145 53Z"
            fill={look.shade}
            stroke="none"
            opacity=".65"
          />
          <path
            d="M101 67Q106 52 119 51"
            stroke="#f7dec0"
            strokeWidth="3"
            opacity=".35"
          />
          <path
            d="M100 85L108 83M131 83L140 85"
            stroke={look.shade}
            strokeWidth="6"
            opacity=".3"
          />
          <g className="portrait-eyes">
            <path
              d="M100 77Q107 72 114 77M127 77Q134 72 141 78"
              strokeWidth="2"
            />
            <path
              d="M101 78Q107 85 113 78M128 79Q134 85 140 79"
              fill="#f0e4d1"
              strokeWidth="1.3"
            />
            <ellipse
              cx={worried ? 109 : 108}
              cy="79"
              rx="2.5"
              ry={alert ? 3.5 : 2.8}
              fill="#34453e"
              stroke="none"
            />
            <ellipse
              cx={worried ? 136 : 134}
              cy="79.5"
              rx="2.5"
              ry={alert ? 3.5 : 2.8}
              fill="#34453e"
              stroke="none"
            />
          </g>
          <g stroke={look.hair} strokeWidth="3.4">
            <path
              d={
                worried
                  ? "M99 69L112 65M128 65L142 71"
                  : alert
                    ? "M99 65L113 67M128 67L141 64"
                    : kind === "traveler" || kind === "guard"
                      ? "M99 67L113 70M128 70L142 67"
                      : "M99 69Q106 65 113 68M128 68Q135 65 142 70"
              }
            />
          </g>
          <path
            d={
              kind === "collector"
                ? "M122 81L116 98L126 99"
                : "M121 82L117 95Q119 98 125 96"
            }
            stroke={look.shade}
            strokeWidth="2"
          />
          <path
            d={
              worried
                ? "M111 108Q120 101 130 108"
                : alert
                  ? "M115 106Q122 102 128 107L126 111H118Z"
                  : kind === "collector"
                    ? "M109 108L123 107L130 104"
                    : "M112 106Q120 110 129 105"
            }
            stroke="#704638"
            strokeWidth="1.9"
            fill={alert ? "#704638" : "none"}
          />
          <path
            d="M115 114L125 114"
            stroke="#f5d5b3"
            strokeWidth="1.5"
            opacity=".45"
          />
          {(kind === "guard" || kind === "mechanic") && (
            <>
              <path
                d="M103 99Q110 111 120 111Q133 112 140 100L136 116Q120 132 104 116Z"
                fill={look.hair}
                opacity=".5"
                stroke="none"
              />
              <path
                d="M110 102Q121 97 132 102"
                stroke={look.hair}
                strokeWidth="4"
              />
            </>
          )}
          {kind === "chef" && (
            <path
              d="M104 102Q111 94 121 102Q132 95 139 104Q127 112 120 105Q111 110 104 102Z"
              fill={look.hair}
              strokeWidth="1"
            />
          )}
          {kind === "collector" && (
            <>
              <path
                d="M100 94L109 95M132 94L141 93M105 99L109 102M134 99L130 102"
                stroke={look.shade}
                strokeWidth="1.1"
              />
              <circle
                cx="106"
                cy="80"
                r="10"
                stroke="#d3b778"
                strokeWidth="2"
              />
              <circle
                cx="135"
                cy="80"
                r="10"
                stroke="#d3b778"
                strokeWidth="2"
              />
              <path
                d="M116 78H125M96 77L91 74M145 77L149 74"
                stroke="#d3b778"
                strokeWidth="2"
              />
            </>
          )}
          {kind === "restorer" ? (
            <>
              <path
                d="M92 69Q98 65 103 50Q115 55 128 36Q150 42 150 74L154 52Q146 24 116 27Q86 30 89 61Z"
                fill={look.hair}
              />
              <path
                d="M101 44Q113 47 124 34M143 43L148 58"
                stroke="#806554"
                strokeWidth="2"
              />
              <circle
                cx="95"
                cy="95"
                r="3"
                fill={look.trim}
                strokeWidth="1.2"
              />
            </>
          ) : kind === "reporter" ? (
            <>
              <path
                d="M88 70Q107 65 134 37Q150 47 150 76L155 55Q148 22 116 25Q82 26 85 59Z"
                fill={look.hair}
              />
              <path d="M94 56Q112 48 124 35" stroke="#66514a" strokeWidth="3" />
              <path
                d="M93 94L98 101L92 104Z"
                fill={look.trim}
                strokeWidth="1.3"
              />
            </>
          ) : kind === "photographer" ? (
            <>
              <path
                d="M88 66Q106 65 123 40Q135 49 150 66L150 44L132 27L105 29L87 45Z"
                fill={look.hair}
              />
              <path
                d="M90 93L87 116L98 117M144 92L149 116L140 119"
                stroke={look.hair}
                strokeWidth="9"
              />
              <path d="M96 43L132 29" stroke="#dfae76" strokeWidth="3" />
              <circle cx="94" cy="96" r="3" fill={look.trim} strokeWidth="1" />
            </>
          ) : kind === "collector" ? (
            <>
              <path
                d="M94 65L97 42L111 45L118 32Q148 32 148 61L153 48Q147 22 119 26Q91 27 89 49Z"
                fill={look.hair}
              />
              <path
                d="M99 40L110 34M126 33L141 42"
                stroke="#e2d6bb"
                strokeWidth="3"
              />
            </>
          ) : kind === "traveler" ? (
            <>
              <path
                d="M91 64L99 47Q125 53 143 35L152 53Q149 22 121 25Q87 21 89 53Z"
                fill={look.hair}
              />
              <path d="M98 39Q118 34 134 32" stroke="#74625b" strokeWidth="3" />
            </>
          ) : kind === "unknown" ? (
            <path
              d="M91 64L102 42L119 48L141 39L150 66L150 43L127 27L99 33Z"
              fill={look.hair}
            />
          ) : null}
          {uniform ? (
            <>
              {kind === "conductor" && (
                <path
                  d="M91 64L97 94M148 64L146 97"
                  stroke={look.hair}
                  strokeWidth="6"
                />
              )}
              <path d="M89 51L94 28Q121 16 150 30L154 53Z" fill={look.coat} />
              <path
                d="M91 48Q122 41 153 50L153 59Q121 51 90 59Z"
                fill={look.trim}
              />
              <path
                d="M86 60Q118 49 158 59Q146 72 122 68L91 66Z"
                fill="#2b4245"
              />
              <path
                d="M116 30H127L126 40L121 43L116 38Z"
                fill={look.trim}
                strokeWidth="1.4"
              />
              {kind === "conductor" && (
                <path
                  d="M102 105L108 106"
                  stroke={look.shade}
                  strokeWidth="1"
                />
              )}
            </>
          ) : kind === "mechanic" ? (
            <>
              <path
                d="M90 52Q94 27 126 28Q150 27 151 51L139 57L92 59Z"
                fill={look.coat}
              />
              <path
                d="M87 58Q119 46 154 54L156 62L110 64L88 62Z"
                fill="#c3a16a"
              />
              <path
                d="M104 33L105 48M137 33L141 48"
                stroke={look.trim}
                strokeWidth="1.5"
              />
            </>
          ) : kind === "chef" ? (
            <>
              <path
                d="M95 56L94 39Q76 27 87 16Q98 6 109 16Q118 -1 132 13Q151 6 157 21Q170 33 147 42V56Z"
                fill="#e6dfc9"
              />
              <path d="M96 43Q119 47 147 43V58H96Z" fill="#faf0d5" />
              <path
                d="M105 22L108 37M131 19L132 36M147 25L142 37"
                stroke="#bdbda9"
                strokeWidth="2"
              />
            </>
          ) : kind === "investigator" ? (
            <>
              <path d="M90 48L100 20L135 17L149 46Z" fill="#817658" />
              <path d="M94 39L145 37L150 49L89 51Z" fill="#443f32" />
              <path
                d="M77 55Q117 39 163 50L164 58Q120 51 77 61Z"
                fill="#b09d70"
              />
            </>
          ) : null}
        </g>
      </g>
    </svg>
  );
}
