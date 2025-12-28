# Queue Example

Add a standard item:

```sh
ato q add "Fix button hover state" \
  --type bug \
  --target 0.1.2 \
  --priority P1 \
  --tags ui-primitives \
  --rationale "Hover state violates token contract." \
  --scope "Update styles | Update story" \
  --acceptance "Hover matches tokens; story updated" \
  --risks "None"
```

Pick the next item:

```sh
ato q next --focus ui-primitives --limit 3
```

Complete (fast gate by default):

```sh
ato q done BL-0001
```
